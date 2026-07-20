package main

import (
	"bufio"
	"context"
	"fmt"
	"net"
	"os"
	"strings"
	"sync"
	"time"
)

type Result struct {
	Domain string
	IsUp   bool
}

func worker(jobs <-chan string, results chan<- Result, wg *sync.WaitGroup, resolver *net.Resolver) {
	defer wg.Done()

	for domain := range jobs {
		// Timeout 2 giây cho mỗi request DNS
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		_, err := resolver.LookupHost(ctx, domain)
		cancel()

		results <- Result{Domain: domain, IsUp: err == nil}
	}
}

func main() {
	inputFileName := "blacklist.txt"

	// 1. Mở file đầu vào
	file, err := os.Open(inputFileName)
	if err != nil {
		fmt.Printf("Lỗi mở file %s: %v\n(Hãy chắc chắn file này tồn tại cùng thư mục chạy code)\n", inputFileName, err)
		return
	}
	defer file.Close()

	// 2. Tạo 2 file để lưu kết quả (đệm bằng bufio để ghi đĩa cực nhanh)
	aliveFile, _ := os.Create("alive.txt")
	deadFile, _ := os.Create("dead.txt")
	defer aliveFile.Close()
	defer deadFile.Close()

	aliveWriter := bufio.NewWriter(aliveFile)
	deadWriter := bufio.NewWriter(deadFile)
	// Đảm bảo xả hết data từ RAM xuống ổ cứng khi kết thúc
	defer aliveWriter.Flush() 
	defer deadWriter.Flush()

	// 3. Cấu hình Worker & DNS
	numWorkers := 1000 // Tùy chỉnh: 1000 - 5000 tùy sức chịu đựng của mạng nhà bạn
	
	// Khởi tạo channel với buffer vừa đủ để không tràn RAM
	jobs := make(chan string, numWorkers*2)
	results := make(chan Result, numWorkers*2)
	var wg sync.WaitGroup

	// Bắn qua DNS của Cloudflare (1.1.1.1) và Google (8.8.8.8)
	resolver := &net.Resolver{
		PreferGo: true,
		Dial: func(ctx context.Context, network, address string) (net.Conn, error) {
			d := net.Dialer{Timeout: 2 * time.Second}
			return d.DialContext(ctx, "udp", "8.8.8.8:53")
		},
	}

	startTime := time.Now()
	fmt.Println("Đang quét, vui lòng đợi...")

	// 4. Khởi động bầy Worker
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(jobs, results, &wg, resolver)
	}

	// 5. Luồng đọc file: Đọc từng dòng và đẩy vào Channel
	go func() {
		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			domain := strings.TrimSpace(scanner.Text())
			// Bỏ qua dòng trống
			if domain != "" {
				jobs <- domain
			}
		}
		close(jobs) // Đọc hết file thì đóng channel jobs
	}()

	// 6. Luồng chờ: Khi tất cả worker xong việc thì đóng channel kết quả
	go func() {
		wg.Wait()
		close(results)
	}()

	// 7. Nhận kết quả và ghi vào file
	successCount := 0
	failCount := 0

	for res := range results {
		if res.IsUp {
			successCount++
			aliveWriter.WriteString(res.Domain + "\n")
		} else {
			failCount++
			deadWriter.WriteString(res.Domain + "\n")
		}
	}

	// Xả nốt buffer cuối cùng xuống ổ đĩa
	aliveWriter.Flush()
	deadWriter.Flush()

	fmt.Println("---------------------------------------------------")
	fmt.Printf("Hoàn thành! Đã kiểm tra xong.\n")
	fmt.Printf("[SỐNG]: %d (Đã lưu vào alive.txt)\n", successCount)
	fmt.Printf("[CHẾT]: %d (Đã lưu vào dead.txt)\n", failCount)
	fmt.Printf("Tổng thời gian: %v\n", time.Since(startTime))
}