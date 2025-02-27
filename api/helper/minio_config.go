package helper

import (
	"context"
	"fmt"
	"log"
	"path/filepath"
	"regexp"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	// "github.com/minio/minio-go/v7/pkg/cors"
)

func InitMinIO(endpoint, accessKey, secretKey string) (*minio.Client, error) {
	// Initialize MinIO client
	minioClient, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: false, // Set to true if using HTTPS
	})
	if err != nil {
		return nil, fmt.Errorf("failed to initialize MinIO client: %v", err)
	}

	return minioClient, nil
}

// Helper function for min integer
func MinInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// sanitizeFileName ensures the file name is valid
func sanitizeFileName(filename string) string {
	// Remove any path components
	filename = filepath.Base(filename)
	// Replace spaces and special characters
	return regexp.MustCompile(`[^a-zA-Z0-9.-]`).ReplaceAllString(filename, "-")
}

func CreateBucketInMinio(ctx context.Context, minioClient *minio.Client, bucketName string) error {
	ctx, cancel := context.WithTimeout(ctx, time.Second*10)
	defer cancel()

	log.Printf("Attempting to create bucket: %s", bucketName)

	// Validate bucket name
	if !isValidBucketName(bucketName) {
		return fmt.Errorf("invalid bucket name: %s", bucketName)
	}

	// Check if bucket exists
	exists, err := minioClient.BucketExists(ctx, bucketName)
	if err != nil {
		log.Printf("Error checking bucket existence: %v", err)
		return fmt.Errorf("bucket check failed: %v", err)
	}

	if !exists {
		// Create the bucket
		err = minioClient.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			log.Printf("Error creating bucket: %v", err)
			return fmt.Errorf("bucket creation failed: %v", err)
		}
		log.Printf("Successfully created bucket: %s", bucketName)
	}

	// Set bucket policy
	policy := fmt.Sprintf(`{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": "*",
                "Action": ["s3:GetObject"],
                "Resource": ["arn:aws:s3:::%s/*"]
            }
        ]
    }`, bucketName)

	if err := minioClient.SetBucketPolicy(ctx, bucketName, policy); err != nil {
		log.Printf("Error setting bucket policy: %v", err)
		return fmt.Errorf("failed to set bucket policy: %v", err)
	}

	return nil
}

// isValidBucketName checks if the bucket name follows S3 naming rules
func isValidBucketName(bucketName string) bool {
	// Rules based on S3 bucket naming conventions
	if len(bucketName) < 3 || len(bucketName) > 63 {
		return false
	}

	// Must start with a lowercase letter or number
	if match, _ := regexp.MatchString(`^[a-z0-9]`, bucketName); !match {
		return false
	}

	// Must end with a lowercase letter or number
	if match, _ := regexp.MatchString(`[a-z0-9]$`, bucketName); !match {
		return false
	}

	// Can contain only lowercase letters, numbers, and hyphens
	if match, _ := regexp.MatchString(`^[a-z0-9-]+$`, bucketName); !match {
		return false
	}

	return true
}
func GenerateFileURL(bucketName, fileName string, minioClient *minio.Client) (string, error) {
	expiration := time.Hour * 24 // URL expiration time (24 hours)

	// Generate the presigned URL with a duration for expiration
	presignedURL, err := minioClient.PresignedGetObject(context.Background(), bucketName, fileName, expiration, nil)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %v", err)
	}
	return presignedURL.String(), nil
}
