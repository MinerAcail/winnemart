package middleware

import (
	"context"
	"log"
	"net"
	"net/http"
	"time"

	"github.com/mineracail/sergi/graph/model"
	"gorm.io/gorm"
)

func getLocalIP() string {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "localhost"
	}
	for _, addr := range addrs {
		if ipNet, ok := addr.(*net.IPNet); ok && !ipNet.IP.IsLoopback() {
			if ipNet.IP.To4() != nil { // IPv4 only
				return ipNet.IP.String()
			}
		}
	}
	return "localhost"
}

// SetOrderTrackingCookie sets an HTTP-only cookie containing the order tracking ID.
func SetOrderTrackingCookie(w http.ResponseWriter, orderID string) error {
	cookie := &http.Cookie{
		Name:     "order_tracking",
		Value:    orderID,
		Path:     "/",
		// Domain:  getLocalIP(),
		HttpOnly: true, // Prevent access from JavaScript
		Secure:   false, // Use Secure (enable in production)
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(24 * time.Hour), // Cookie expires in 24 hours
	}
	log.Println("4 Order ID:", orderID)

	http.SetCookie(w, cookie)
	return nil
}
func SetjobRequestCookie(w http.ResponseWriter, requestId string) error {
	cookie := &http.Cookie{
		Name:     "job_request",
		Value:    requestId,
		// Domain:   "http://*",
		Path:     "/",
		HttpOnly: true,  // Prevent access from JavaScript
		Secure:   false, // Use Secure (enable in production)
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(3 * time.Hour),
	}

	http.SetCookie(w, cookie)
	return nil
}

// GetOrderTrackingCookie retrieves the order tracking ID from the cookie.
func GetOrderTrackingCookie(r *http.Request) (string, error) {
	cookie, err := r.Cookie("order_tracking")
	if err != nil {
		return "", err
	}
	return cookie.Value, nil
}
func GetjobRequestCookie(r *http.Request) (string, error) {
	cookie, err := r.Cookie("job_request")
	if err != nil {
		return "", err
	}
	return cookie.Value, nil
}

// Key type to avoid context key collisions
type ctxKey struct{ name string }

var (
	responseWriterKey = &ctxKey{"responseWriter"}
	requestKey        = &ctxKey{"request"}
)

// AttachResponseWriter adds an HTTP response writer to the context.
func AttachResponseWriter(ctx context.Context, w http.ResponseWriter) context.Context {
	return context.WithValue(ctx, responseWriterKey, w)
}

// AttachRequest adds an HTTP request to the context.
func AttachRequest(ctx context.Context, r *http.Request) context.Context {
	return context.WithValue(ctx, requestKey, r)
}

// GetResponseWriter retrieves the response writer from the context.
func GetResponseWriter(ctx context.Context) (http.ResponseWriter, bool) {
	w, ok := ctx.Value(responseWriterKey).(http.ResponseWriter)
	return w, ok
}

// GetRequest retrieves the request from the context.
func GetRequest(ctx context.Context) *http.Request {
	r, _ := ctx.Value(requestKey).(*http.Request)
	return r
}

// Middleware injects request and response writer into context
func TrackingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		ctx = AttachResponseWriter(ctx, w)
		ctx = AttachRequest(ctx, r)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// CleanupOrderTrackingCookie checks if an order tracking cookie exists,
// verifies if the associated order is completed, and clears the cookie if needed.
func CleanupOrderTrackingCookie(ctx context.Context, db *gorm.DB) {
	req := GetRequest(ctx)
	if req == nil {
		return
	}

	orderID, err := GetOrderTrackingCookie(req)
	if err != nil || orderID == "" {
		return // No cookie or error reading cookie
	}

	// Check if order exists and is completed
	var order model.Order
	if err := db.Where("id = ?", orderID).First(&order).Error; err != nil {
		if err != gorm.ErrRecordNotFound {
			log.Printf("Error checking order status: %v", err)
		}
		return
	}

	// If order is completed, clear the cookie
	if order.Status == "COMPLETED" {
		w, ok := GetResponseWriter(ctx)
		if !ok {
			return // Can't access response writer
		}

		// Clear the cookie
		cookie := &http.Cookie{
			Name:     "order_tracking",
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			Secure:   false,
			SameSite: http.SameSiteLaxMode,
			MaxAge:   -1, // Immediately expires the cookie
		}
		http.SetCookie(w, cookie)
		log.Println("Cleared order tracking cookie for completed order:", orderID)
	}
}
func CleanupRequestrackingCookie(ctx context.Context, db *gorm.DB) {
	req := GetRequest(ctx)
	if req == nil {
		return
	}

	requestId, err := GetjobRequestCookie(req)
	if err != nil || requestId == "" {
		return // No cookie or error reading cookie
	}

	// Check if order exists and is completed
	var request model.JobRequest
	if err := db.Where("id = ?", requestId).First(&request).Error; err != nil {
		if err != gorm.ErrRecordNotFound {
			log.Printf("Error checking request status: %v", err)
		}
		return
	}

	if err := db.Where("id = ?", requestId).First(&request).Error; err != nil {
		w, ok := GetResponseWriter(ctx)
		if !ok {
			return // Can't access response writer
		}

		// Clear the cookie
		cookie := &http.Cookie{
			Name:     "job_request",
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			Secure:   false,
			SameSite: http.SameSiteLaxMode,
			MaxAge:   -1, // Immediately expires the cookie
		}
		http.SetCookie(w, cookie)
		log.Println("Cleared request tracking cookie for completed request:", requestId)
	}
}
