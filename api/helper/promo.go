package helper

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"time"

	"github.com/mineracail/sergi/graph/model"
	"gorm.io/gorm"
)

func GenerateRandomCode(ctx context.Context, db *gorm.DB, length int) (string, error) {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	rand.Seed(time.Now().UnixNano())

	for {
		// Generate a random promo code
		code := make([]byte, length)
		for i := range code {
			code[i] = charset[rand.Intn(len(charset))]
		}
		promoCode := string(code)

		// Check if the promo code already exists in the database
		var existingPromo model.PromoCode
		if err := db.Where("promo_code = ?", promoCode).First(&existingPromo).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				// No duplicate found, return this code
				return promoCode, nil
			}
			// Unexpected database error
			return "", fmt.Errorf("failed to check promo code uniqueness: %w", err)
		}

		// If a duplicate is found, the loop continues to generate a new one
	}
}
func CalculateCommission(price float64) float64 {
	switch {
	case price < 5:
		return 0.5
	case price >= 5 && price <= 20:
		return 1
	case price > 20 && price <= 50:
		return 5
	case price > 50 && price <= 100:
		return 10
	case price > 100 && price <= 300:
		return 20
	case price > 300 && price <= 500:
		return 50
	case price > 500 && price <= 1000:
		return 100
	case price > 1000 && price <= 1500:
		return 150
	case price > 1500 && price <= 2000:
		return 200
	default:
		return 0
	}
}
