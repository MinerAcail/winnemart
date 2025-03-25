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
func ExecuteSearchQuery(db *gorm.DB, query string) ([]*model.Product, error) {
	var products []*model.Product
	similarityThreshold := 0.12

	err := db.Raw(`
        WITH ranked_products AS (
            SELECT 
                *,
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
                search_vector @@ plainto_tsquery('english', ?) OR 
                (similarity(LOWER(name), LOWER(?)) > CAST(? AS NUMERIC)) OR 
                (name ILIKE '%' || ? || '%') OR 
                (name ILIKE ? || '%') OR 
                (levenshtein(LOWER(name), LOWER(?)) <= 2)
        )
        SELECT * FROM ranked_products
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
		query, query, query, query, query, query, query, query).Find(&products).Error

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
                search_vector @@ plainto_tsquery('english', ?) OR 
                (similarity(LOWER(name), LOWER(?)) > CAST(? AS NUMERIC)) OR 
                (name ILIKE '%' || ? || '%') OR 
                (name ILIKE ? || '%') OR 
                (levenshtein(LOWER(name), LOWER(?)) <= 2)
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
func FetchAllProducts(db *gorm.DB) ([]*model.Product, error) {
	var products []*model.Product
	if err := db.Where("state != ?", "INACTIVE").Order("created_at DESC").Find(&products).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch products: %v", err)
	}
	return products, nil
}

func FetchProductsWithVendorPriority(db *gorm.DB, vendorID string) ([]*model.Product, error) {
    var vendorProducts []*model.Product
    var otherProducts []*model.Product
    
    // Fetch products with the specified vendorID
    if err := db.Where("vendor_id = ?", vendorID).Order("created_at DESC").Find(&vendorProducts).Error; err != nil {
        return nil, fmt.Errorf("failed to fetch vendor products: %v", err)
    }
    
    // Fetch all other products
    if err := db.Where("vendor_id IS NULL OR vendor_id != ?", vendorID).Order("created_at DESC").Find(&otherProducts).Error; err != nil {
        return nil, fmt.Errorf("failed to fetch other products: %v", err)
    }
    
    // Combine the results with vendor products first
    allProducts := append(vendorProducts, otherProducts...)
    
    return allProducts, nil
}