package model

import (
	"github.com/google/uuid"
)

type GeneratedPromoCode struct {
	ID uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
	PromoCodeID string  `json:"promoCodeID"`
	UserNumber  string  `json:"userNumber"`
	TotalAmount float64 `json:"totalAmount"`
	OrderID     string  `json:"orderID"`
	CreatedAt   string  `json:"createdAt"`
}
type PromoCode struct {
	ID              uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
	AdvertiserID    string    `json:"advertiserID"`
	PromoCode       string    `json:"promoCode"`
	DiscountApplied float64   `json:"discountApplied"`
	CreatedAt       string    `json:"createdAt"`
}
 