package helper

import (
	"fmt"
	"strings"

	"github.com/mineracail/sergi/graph/model"
	"gorm.io/gorm"
)

func CleanSearchQuery(query string) string {
	return strings.TrimSpace(query)
}

// executeSearchQuery performs the full-text search with ranking
func ExecuteSearchQuery(db *gorm.DB, queryString string) ([]*model.Product, error) {
	var products []*model.Product
	// similarityThreshold := 0.12
	
	// Split the query string into individual terms and trim whitespace
	queryTerms := strings.Split(queryString, ",")
	for i := range queryTerms {
		queryTerms[i] = strings.TrimSpace(queryTerms[i])
	}
	
	// Filter out empty terms
	var validTerms []string
	for _, term := range queryTerms {
		if term != "" {
			validTerms = append(validTerms, term)
		}
	}
	
	// If no valid terms, return empty result
	if len(validTerms) == 0 {
		return products, nil
	}
	
	// Create the combined query for searching across all terms
	combinedQuery := strings.Join(validTerms, " | ")
	
	// Build a CASE statement for ordering based on which term matches and its position
	var orderCaseWhenClauses []string
	for i, term := range validTerms {
		// The earlier the term appears in the list, the higher its priority (lower i value)
		priority := len(validTerms) - i
		
		orderCaseWhenClauses = append(orderCaseWhenClauses, fmt.Sprintf(`
			WHEN LOWER(name) = LOWER('%s') THEN %d * 10.0
			WHEN name ILIKE '%%%s%%' THEN %d * 5.0
		`, term, priority, term, priority))
	}
	
	orderCaseStatement := strings.Join(orderCaseWhenClauses, " ")
	
	// Execute the search query with priority ordering
	err := db.Raw(`
		WITH ranked_products AS (
			SELECT 
				* ,
				ts_rank_cd(search_vector, to_tsquery('english', ?)) AS ts_rank_val,
				CASE
					` + orderCaseStatement + `
					ELSE 0 
				END AS term_priority
			FROM products
			WHERE 
				state != 'INACTIVE' AND 
				(
					search_vector @@ to_tsquery('english', ?) OR 
					` + buildSimOrLikeConditions(validTerms) + `
				)
		)
		SELECT * FROM ranked_products
		ORDER BY
			term_priority DESC,
			ts_rank_val DESC
		LIMIT 50
	`, combinedQuery, combinedQuery).Find(&products).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to search products: %v", err)
	}
	
	return products, nil
}

// Helper function to build OR conditions for each term
func buildSimOrLikeConditions(terms []string) string {
	var conditions []string
	
	for _, term := range terms {
		condition := fmt.Sprintf(`
			(similarity(LOWER(name), LOWER('%s')) > 0.12) OR 
			(name ILIKE '%%%s%%') OR 
			(name ILIKE '%s%%') OR 
			(levenshtein(LOWER(name), LOWER('%s')) <= 2)
		`, term, term, term, term)
		conditions = append(conditions, condition)
	}
	
	return "(" + strings.Join(conditions, " OR ") + ")"
}
func ExecuteSearchQueryNew(db *gorm.DB, queryString string, limit int, offset int) ([]*model.Product, error) {
	var products []*model.Product

	queryTerms := strings.Split(queryString, ",")
	for i := range queryTerms {
		queryTerms[i] = strings.TrimSpace(queryTerms[i])
	}
	
	var validTerms []string
	for _, term := range queryTerms {
		if term != "" {
			validTerms = append(validTerms, term)
		}
	}

	if len(validTerms) == 0 {
		return products, nil
	}

	combinedQuery := strings.Join(validTerms, " | ")

	var orderCaseWhenClauses []string
	for i, term := range validTerms {
		priority := len(validTerms) - i
		orderCaseWhenClauses = append(orderCaseWhenClauses, fmt.Sprintf(`
			WHEN LOWER(name) = LOWER('%s') THEN %d * 10.0
			WHEN name ILIKE '%%%s%%' THEN %d * 5.0
		`, term, priority, term, priority))
	}

	orderCaseStatement := strings.Join(orderCaseWhenClauses, " ")

	err := db.Raw(`
		WITH ranked_products AS (
			SELECT 
				*,
				ts_rank_cd(search_vector, to_tsquery('english', ?)) AS ts_rank_val,
				CASE
					` + orderCaseStatement + `
					ELSE 0 
				END AS term_priority
			FROM products
			WHERE 
				state != 'INACTIVE' AND 
				(
					search_vector @@ to_tsquery('english', ?) OR 
					` + buildSimOrLikeConditions(validTerms) + `
				)
		)
		SELECT * FROM ranked_products
		ORDER BY
			term_priority DESC,
			ts_rank_val DESC
		LIMIT ? OFFSET ?
	`, combinedQuery, combinedQuery, limit, offset).Find(&products).Error

	if err != nil {
		return nil, fmt.Errorf("failed to search products: %v", err)
	}

	return products, nil
}
func ExecuteSearchQueryWithVendorPriority(db *gorm.DB, query string, vendorID string) ([]*model.Product, error) {
	var products []*model.Product
	similarityThreshold := 0.12

	err := db.Raw(`
        WITH ranked_products AS (
            SELECT 
                *,
                (CASE WHEN vendor_id = ? THEN 1 ELSE 0 END) AS is_vendor_match,
                ts_rank_cd(search_vector, plainto_tsquery('english', ?)) AS ts_rank_val,
                similarity(LOWER(name), LOWER(?)) AS name_sim,
                word_similarity(name, ?) AS word_sim,
                GREATEST(
                    similarity(LOWER(name), LOWER(?)),
                    similarity(LOWER(?), LOWER(name))
                ) AS bidirectional_sim,
                levenshtein(LOWER(name), LOWER(?)) AS typo_distance
            FROM products
            WHERE 
                state != 'INACTIVE' AND 
                (search_vector @@ plainto_tsquery('english', ?) OR 
                (similarity(LOWER(name), LOWER(?)) > CAST(? AS NUMERIC)) OR 
                (name ILIKE '%' || ? || '%') OR 
                (name ILIKE ? || '%') OR 
                (levenshtein(LOWER(name), LOWER(?)) <= 2))
        )
        SELECT * FROM ranked_products
        ORDER BY
            is_vendor_match DESC,
            CASE 
                WHEN LOWER(name) = LOWER(?) THEN 10.0
                WHEN name ILIKE ? THEN 8.0
                WHEN name ILIKE ? || '%' THEN 6.0
                WHEN name ILIKE '%' || ? || '%' THEN 4.0
                ELSE 0 
            END +
            (bidirectional_sim * 10.0) +
            (name_sim * 5.0) +
            (ts_rank_val * 2.0) +
            (word_sim * 3.0) +
            (CASE WHEN typo_distance <= 2 THEN (5 - typo_distance) * 2 ELSE 0 END)
        DESC LIMIT 50
    `, vendorID, query, query, query, query, query, query, query, query, fmt.Sprintf("%f", similarityThreshold),
		query, query, query, query, query, query, query, query).Find(&products).Error

	if err != nil {
		return nil, fmt.Errorf("failed to search products: %v", err)
	}

	return products, nil
}

func ExecuteCategorySearchQuery(db *gorm.DB, query string) ([]*model.CategoryBox, error) {
	var categoryBoxes []*model.CategoryBox
	similarityThreshold := 0.12

	err := db.Raw(`
        WITH ranked_categories AS (
            SELECT 
                * ,
                ts_rank_cd(search_vector, plainto_tsquery('english', ?)) AS ts_rank_val,
                similarity(LOWER(name), LOWER(?)) AS name_sim,
                word_similarity(name, ?) AS word_sim,
                GREATEST(
                    similarity(LOWER(name), LOWER(?)),
                    similarity(LOWER(?), LOWER(name))
                ) AS bidirectional_sim,
                levenshtein(LOWER(name), LOWER(?)) AS typo_distance
            FROM category_boxes
            WHERE 
                search_vector @@ plainto_tsquery('english', ?) OR 
                (similarity(LOWER(name), LOWER(?)) > CAST(? AS NUMERIC)) OR 
                (name ILIKE '%' || ? || '%') OR 
                (name ILIKE ? || '%') OR 
                (levenshtein(LOWER(name), LOWER(?)) <= 2)
        )
        SELECT * FROM ranked_categories
        ORDER BY
            CASE 
                WHEN LOWER(name) = LOWER(?) THEN 10.0
                WHEN name ILIKE ? THEN 8.0
                WHEN name ILIKE ? || '%' THEN 6.0
                WHEN name ILIKE '%' || ? || '%' THEN 4.0
                ELSE 0 
            END +
            (bidirectional_sim * 10.0) +
            (name_sim * 5.0) +
            (ts_rank_val * 2.0) +
            (word_sim * 3.0) +
            (CASE WHEN typo_distance <= 2 THEN (5 - typo_distance) * 2 ELSE 0 END)
        DESC LIMIT 50
    `, query, query, query, query, query, query, query, query, fmt.Sprintf("%f", similarityThreshold),
		query, query, query, query, query, query, query, query).Find(&categoryBoxes).Error

	if err != nil {
		return nil, fmt.Errorf("failed to search categories: %v", err)
	}

	return categoryBoxes, nil
}

// fetchAllProducts retrieves all products ordered by created_at
func FetchAllProduct(db *gorm.DB) ([]*model.Product, error) {
	var products []*model.Product
	if err := db.Where("state != ?", "INACTIVE").Order("created_at DESC").Find(&products).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch products: %v", err)
	}
	return products, nil
}

// func FetchAllProducts(db *gorm.DB) ([]*model.Product, error) {
// 	var products []*model.Product

// 	// Get current hour
// 	currentHour := time.Now().Hour()
// 	var timeCategory string

// 	// Determine the current time category
// 	switch {
// 	case currentHour >= 5 && currentHour < 12:
// 		timeCategory = "morning"
// 	case currentHour >= 12 && currentHour < 17:
// 		timeCategory = "afternoon"
// 	default:
// 		timeCategory = "evening"
// 	}

// 	// Order products based on time relevance and price (lower prices first)
// 	if err := db.Where("state != ?", "INACTIVE").
// 		Order(fmt.Sprintf(`
// 			CASE
// 				WHEN categories @> ARRAY['%s'] THEN 1  -- Exact time match first
// 				WHEN categories @> ARRAY['morning', 'afternoon', 'evening'] THEN 2  -- All time categories
// 				WHEN categories && ARRAY['morning', 'afternoon', 'evening'] THEN 3  -- At least one time category
// 				ELSE 4  -- No time category
// 			END,
// 			CAST(price AS NUMERIC) ASC, -- Sort by lowest price within each category
// 			created_at DESC -- If price is the same, show newest products first
// 		`, timeCategory)).
// 		Find(&products).Error; err != nil {
// 		return nil, fmt.Errorf("failed to fetch products: %v", err)
// 	}

// 	return products, nil
// }

func FetchAllProducts(db *gorm.DB, limit int, offset int) ([]*model.Product, error) {
	var products []*model.Product

	query := db.Where("state != ?", "INACTIVE")

	if err := query.
		Order(`
            FLOOR(CAST(price AS NUMERIC) / 10) ASC,
            MD5(array_to_string(categories, ',')) ASC,
            gen_random_uuid()
        `).
		Limit(limit).
		Offset(offset).
		Find(&products).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch products: %v", err)
	}

	return products, nil
}

func FetchProductsWithVendorPriority(db *gorm.DB, vendorID string) ([]*model.Product, error) {
	var vendorProducts []*model.Product
	var otherProducts []*model.Product

	// Fetch products with the specified vendorID, excluding inactive products
	if err := db.Where("state != ? AND vendor_id = ?", "INACTIVE", vendorID).
		Order("created_at DESC").Find(&vendorProducts).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch vendor products: %v", err)
	}

	// Fetch all other products, excluding inactive products
	if err := db.Where("state != ? AND (vendor_id IS NULL OR vendor_id != ?)", "INACTIVE", vendorID).
		Order("created_at DESC").Find(&otherProducts).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch other products: %v", err)
	}

	// Combine the results with vendor products first
	allProducts := append(vendorProducts, otherProducts...)

	return allProducts, nil
}
