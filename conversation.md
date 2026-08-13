**User:**
#471880 - [IR][Deploy/TSPI] Triển khai Zero-Downtime Deployment nhằm giảm ảnh hưởng đến hoạt động Testing (QC) và nâng cao khả năng triển khai liên tục:
1. Quy trình được cải tiến
Quy trình hiện tại
Development Process
@Code Development → Build → Deploy → QC Testing → UAT → Release
*Phạm vi cải tiến
Cải tiến bước:
Deploy Environment Management
Mục tiêu:
Đảm bảo không gián đoạn môi trường Local khi triển khai.
Cho phép deploy nhiều lần trong ngày phục vụ development và bug fixing.
Giảm thời gian chờ của QC.
Hỗ trợ Continuous Delivery.
2. Hiện trạng trước khi triển khai
Hiện tại hệ thống sử dụng phương thức deploy trực tiếp lên môi trường Local.
Quá trình deploy:
Stop Application → Deploy Version Mới → Start Application
Các vấn đề phát sinh:
QC bị gián đoạn trong thời gian deploy.
Test case đang thực hiện có thể bị fail do service unavailable.
Khi nhiều bug cần fix liên tục, số lần deploy tăng lên gây ảnh hưởng đến tiến độ kiểm thử.
Có rủi ro rollback phức tạp khi deploy lỗi.
Team khó triển khai Continuous Delivery.
Ví dụ thực tế:
Mỗi lần deploy mất 5~15 phút.
Trung bình 3~5 lần deploy/ngày trong giai đoạn SIT/UAT.
QC phải tạm dừng kiểm thử hoặc thực hiện lại test case.
3. Giải pháp cải tiến
Áp dụng mô hình Zero-Downtime Deployment theo hướng Blue-Green Deployment.
Quy trình mới: Build New Version → Deploy Song Song → Health Check → Switch Traffic → Remove Old Version
4. Value mang lại
QC có thể kiểm thử liên tục.
Tăng tốc độ fix bug.
Giảm rủi ro triển khai.
Hỗ trợ Continuous Delivery.
Nâng cao chất lượng môi trường kiểm thử.
5. Phương pháp đo lường hiệu quả
Theo dõi downtime trong quá trình deploy.
Target: Downtime = 0 phút
Theo dõi số lượng incident do deploy.
Target:  0 incident/tháng
Theo dõi số lượng deploy thành công.
Target: >= 95%
Khảo sát QC Team.
Target: 100% deploy không làm gián đoạn quá trình test
6. Definition of Done (SMART)
Specific
Thiết kế Jenkins Pipeline hỗ trợ Zero-Downtime Deployment.
Triển khai Blue-Green Deployment trên môi trường Local.
Xây dựng rollback procedure.
Measurable
Thực hiện tối thiểu 10 lần deploy thử nghiệm.
Không phát sinh downtime trong các lần deploy.
Achievable
Áp dụng trên toàn bộ môi trường Local.
Relevant
Gắn trực tiếp với Development Process và Release Management Process.
Time-bound
Hoàn thành trong Sprint XX.
7. Deliverables
Jenkins Pipeline mới.
Deployment Guideline.
Rollback Guideline.
Health Check Documentation.
Báo cáo kết quả thử nghiệm.
8. Tài liệu cần cập nhật
Development Process
Deployment Guideline step 5 Build Internally & Inform Team
9. Bằng chứng hoàn thành
Jenkins Pipeline Screenshot.
Log deploy thành công.
Kết quả health check.
Kết quả rollback test.
Sprint Review Demo Cho Dev and QC.
Expected Business Value
Việc áp dụng Zero-Downtime Deployment giúp QC không bị gián đoạn khi
team cần deploy liên tục trong giai đoạn SIT/UAT, giảm thời gian chờ
đợi giữa Developer và QC, tăng tốc độ xử lý bug, nâng cao tần suất
release và tạo nền tảng cho Continuous Delivery trong dự án. Hiện tại đây là task cải tiến của tôi, bạn đã hiểu sơ và có thắc mắc gì không

**AI:**
Tôi đã nắm rõ tổng quan về bản đề xuất cải tiến **#471880 - Triển khai Zero-Downtime Deployment**. Kế hoạch của bạn được trình bày rất logic, cấu trúc chuẩn mực và giải quyết đúng "điểm nghẽn" (bottleneck) thực tế của đội ngũ.

## Tóm tắt hệ thống hóa

Bản kế hoạch của bạn đang tập trung vào các trọng tâm xuất sắc:

- **Vấn đề cốt lõi:** Thời gian chết (5-15 phút) nhân với số lần deploy (3-5 lần/ngày) trong giai đoạn SIT/UAT làm gián đoạn test case của QC và giảm năng suất.
- **Giải pháp:** Loại bỏ mô hình truyền thống (Stop → Deploy → Start) và áp dụng **Blue-Green Deployment** qua Jenkins (chạy song song → kiểm tra → chuyển traffic).
- **Tiêu chí thành công (SMART):** Rõ ràng, đo lường được (0 downtime, 0 incident, tỷ lệ thành công >= 95%) và có phương án dự phòng (Rollback).

## Các điểm kỹ thuật cần làm rõ

Để quá trình triển khai trơn tru và đảm bảo Definition of Done (DoD) khả thi 100% trên thực tế, tôi có 3 thắc mắc về mặt kỹ thuật kiến trúc:

1. **Chiến lược Database (Database Migrations):** Trong mô hình Blue-Green, khi chạy song song hai phiên bản (Old và New), cả hai thường phải đọc/ghi trên cùng một Database. Nếu bản New chứa các script thay đổi cấu trúc dữ liệu (ví dụ: đổi tên cột, xóa bảng), bản Old đang phục vụ QC sẽ bị lỗi ngay lập tức. Hệ thống của bạn đã có chiến lược thiết kế Database theo hướng *Backward Compatible* (tương thích ngược) chưa?
2. **Tài nguyên hạ tầng (Infrastructure Resources):** Tại khoảnh khắc Deploy Song Song, server sẽ phải gánh cùng lúc hai ứng dụng (Blue và Green). Môi trường server Local hiện tại có đủ tài nguyên (RAM/CPU dư địa) để chạy cùng lúc hai bản build mà không gây ra tình trạng tràn RAM (Out of Memory) hay không?
3. **Cơ chế điều hướng (Traffic Switching):** Trong bước "Switch Traffic", kiến trúc hiện tại dự định sử dụng công cụ nào để điều hướng request tĩnh và động mượt mà nhất (Ví dụ: tự động reload cấu hình **Nginx / HAProxy**, hay sử dụng Service của **Docker Swarm / Kubernetes**)?

Bạn muốn chúng ta đi sâu vào bàn luận cách xử lý bài toán đồng bộ Database trước, hay thiết kế kịch bản Switch Traffic trong Jenkins Pipeline?

---

**User:**
vậy tôi cần làm rõ những gì trước khi làm task

**AI:**
Để đảm bảo việc triển khai Zero-Downtime Deployment thành công ngay từ lần chạy đầu tiên và không gây ra tác dụng phụ làm sập môi trường, bạn cần thảo luận và làm rõ **4 nhóm vấn đề cốt lõi** sau với team (đặc biệt là Tech Lead, DevOps/Infra và QC):

### 1. Về Hạ tầng & Cơ chế điều hướng (Infrastructure & Routing)

Kiến trúc Blue-Green bắt buộc phải có một "người gác cổng" để chuyển hướng traffic từ bản cũ sang bản mới.

- **Công cụ Load Balancer/Proxy đang dùng là gì?** Hệ thống đang dùng Nginx, HAProxy, Traefik, hay Ingress (nếu dùng Kubernetes)?
- **Quyền truy cập của Jenkins:** Jenkins Pipeline có quyền cấu hình lại (reload) cái Proxy/Router đó để trỏ sang port/IP của phiên bản mới (Green) hay không?
- **Tài nguyên Server (RAM/CPU):** Môi trường Local/SIT hiện tại có đủ dư địa tài nguyên để chạy song song 2 phiên bản (Blue và Green) trong cùng một thời điểm không? (Ví dụ: Nếu server đang ăn 70% RAM, khi bật thêm bản Green có thể gây sập server trước khi kịp tắt bản Blue).

### 2. Về Dữ liệu & Trạng thái (Database & State)

Đây là rào cản lớn nhất của Zero-Downtime. Hai phiên bản source code khác nhau sẽ phải chạy chung trên một Database trong lúc chuyển giao.

- **Quy trình thay đổi Database (Migration):** Team Development có đồng ý tuân thủ nguyên tắc thiết kế Database tương thích ngược (Backward Compatibility) không? Tức là khi có tính năng mới, Dev chỉ được thêm cột/bảng mới, không được xóa hoặc đổi tên cột cũ để đảm bảo bản Blue đang chạy không bị crash.
- **Quản lý Session (Phiên đăng nhập):** Khi bạn "Switch Traffic" sang bản Green, các bạn QC đang test dở có bị văng ra màn hình đăng nhập không? (Nếu session lưu trên RAM của server cũ thì sẽ bị văng; nếu lưu tập trung trên Redis thì sẽ an toàn).

### 3. Về Tiêu chí Health Check (Đánh giá sức khỏe ứng dụng)

Jenkins cần một cơ sở tự động để biết bản Green đã thực sự "sống" trước khi gạt traffic sang.

- **API Health Check:** Source code hiện tại (Backend) đã có sẵn một endpoint như `/api/health` hay `/ping` chưa?
- **Định nghĩa "Sẵn sàng":** Health Check chỉ cần trả về HTTP Status 200 là đủ, hay cần phải check cả việc kết nối thành công tới Database/Redis thì mới tính là pass?
- **Thời gian chờ (Timeout):** Jenkins sẽ gọi Health Check bao nhiêu lâu một lần và thử tối đa bao nhiêu lần trước khi kết luận là bản Green bị lỗi và hủy bỏ deploy?

### 4. Về Kịch bản Rollback (Hoàn tác)

Trong Definition of Done của bạn có nhắc đến "Rollback procedure".

- **Kích hoạt Rollback:** Sẽ là tự động hay thủ công? (Ví dụ: Tự động đổi về Blue nếu Green trả về lỗi 500 liên tục trong 1 phút đầu, hay phải có người ấn nút "Rollback" trên Jenkins?).
- **Dọn dẹp (Cleanup):** Bản Blue (phiên bản cũ) sẽ được giữ lại chạy ngầm trong bao lâu sau khi switch traffic thành công để phòng hờ cần quay xe? (Thường là giữ lại vài tiếng hoặc đến lần deploy tiếp theo mới xóa).

Khi đã có câu trả lời cho các vấn đề trên, bạn sẽ hình dung được chính xác từng dòng lệnh script cần viết trong Jenkins Pipeline.

---

**User:**
tại tôi mới vào công ty nên chưa hình dung rõ về task này

**AI:**
Việc mới vào công ty và được giao ngay một task liên quan đến CI/CD (hạ tầng triển khai) cảm thấy "ngợp" là tâm lý rất bình thường. Tuy nhiên, đây là một cơ hội cực kỳ tốt để bạn nắm bắt toàn bộ luồng đi của mã nguồn từ lúc code xong cho đến khi lên server.

Để dễ hình dung nhất, hãy tưởng tượng ứng dụng của công ty đang phục vụ team QC giống như một **nhà hàng**:

- **Cách cũ (Có Downtime):** Đuổi hết khách ra ngoài (Stop App) -> Thay thực đơn, sắp xếp lại bàn ghế (Deploy) -> Mở cửa lại (Start App). Trong lúc đó, khách (QC) phải đứng ngoài đợi 5-15 phút.
- **Cách mới (Zero-Downtime theo hướng Blue-Green):** Bạn thuê một mặt bằng ngay sát bên cạnh và setup một nhà hàng mới y hệt (Deploy bản mới lên một Port/Server khác). Nấu nướng, kiểm tra xong xuôi (Health Check). Khi mọi thứ hoàn hảo, bạn chỉ cần quay biển chỉ đường sang nhà hàng mới (Switch Traffic). Khách (QC) vẫn tiếp tục ăn mà không hề biết nhà hàng vừa được thay mới.

Dưới đây là từng bước hành động thực tế để bạn bắt đầu giải quyết task này mà không bị rối.

## 1. Khảo sát hiện trạng (Giao tiếp với team)

Đừng vội viết code hay sửa Jenkins ngay. Bạn cần hẹn Tech Lead hoặc kỹ sư DevOps/Infra hiện tại để hỏi 3 thông tin quan trọng nhất:

- Hệ thống đang chạy trên nền tảng gì? (Đang chạy bằng Docker, Kubernetes, hay chạy trực tiếp tiến trình trên server).
- Công cụ nào đang đứng trước để nhận traffic? (Thường là Nginx, HAProxy, hoặc Traefik).
- Xin quyền đọc (Read-only) file cấu hình Jenkins hiện tại (thường là file `Jenkinsfile`) để hiểu luồng cũ đang chạy như thế nào.

## 2. Làm nháp trên máy cá nhân (Proof of Concept)

Trước khi động vào môi trường Local/SIT của công ty, hãy tạo một môi trường giả lập trên máy tính của bạn.

- Tạo một ứng dụng đơn giản. Ví dụ, nếu dự án dùng React cho frontend và FastAPI cho backend, bạn có thể thiết lập hai container FastAPI chạy ở hai port khác nhau (ví dụ: port 8000 là Blue, port 8001 là Green).
- Cài đặt Nginx làm công cụ điều hướng.
- Viết một đoạn script nhỏ để Nginx chuyển hướng (route) từ port 8000 sang 8001 mà không làm rớt kết nối. Khi bạn làm được điều này trên máy mình, bạn đã hoàn thành 50% task.

## 3. Chỉnh sửa Jenkins Pipeline

Đây là lúc bạn đưa giải pháp vào hệ thống tự động. Một Pipeline chuẩn cho Zero-Downtime sẽ chạy theo thứ tự:

- **Build:** Đóng gói phiên bản mới nhất.
- **Deploy Green:** Chạy phiên bản mới lên một không gian dự phòng (ví dụ port 8001) trong khi bản cũ vẫn chạy ở port 8000.
- **Health Check:** Jenkins sẽ tự động gọi một đường dẫn (ví dụ `curl http://localhost:8001/health`) liên tục trong vài giây. Nếu trả về trạng thái 200 OK, hệ thống xác nhận bản mới đã sống.
- **Switch Traffic:** Jenkins chạy lệnh reload cấu hình Nginx để trỏ toàn bộ request mới sang port 8001.
- **Cleanup:** Tắt ứng dụng ở port 8000 để giải phóng RAM cho server.

## 4. Kiểm thử và Báo cáo (Demo)

Để chứng minh task hoàn thành (Definition of Done), bạn cần một bài test thực tế:

- Bạn mở trình duyệt và viết một script tự động bấm liên tục (hoặc nhờ một bạn QC thao tác tay liên tục trên hệ thống).
- Cùng lúc đó, bạn bấm nút Deploy trên Jenkins.
- Nếu màn hình Jenkins báo Deploy Success mà bạn QC kia không hề bị gián đoạn hay báo lỗi mạng, task của bạn đã hoàn thành xuất sắc.

Hệ thống của công ty bạn hiện tại đang chạy các service này dưới dạng Docker container hay chạy trực tiếp tiến trình trên máy chủ?

---

**User:**
Công cụ nào đang đứng trước để nhận traffic? (Thường là Nginx, HAProxy, hoặc Traefik). này là gì vậ

**AI:**
Chào bạn, câu hỏi rất hay. Khi mới làm quen với hệ thống backend và hạ tầng, khái niệm này nghe hơi trừu tượng một chút, nhưng thực tế nó cực kỳ gần gũi.

Khái niệm chung của các công cụ này gọi là **Reverse Proxy** (Proxy ngược) hoặc **Load Balancer** (Bộ cân bằng tải).

Để dễ hiểu nhất, bạn hãy tưởng tượng ứng dụng web của công ty giống như một **tòa nhà công ty lớn**, còn cái công cụ đứng trước này chính là **Cô Lễ Tân (Receptionist)**.

## Tại sao lại cần "Cô Lễ Tân"?

Khi bạn QC (hoặc người dùng) gõ vào trình duyệt `kiemthu.congty.com`, họ không đi thẳng vào bên trong mã nguồn ứng dụng (ví dụ: code FastAPI hay React) đang chạy trên máy chủ. Thay vào đó, họ sẽ gặp "Cô Lễ Tân" trước tiên.

- **Nếu không có lễ tân:** Khách tự chạy lộn xộn vào các phòng ban tìm người. Nếu tòa nhà sập (ứng dụng đang deploy lại), khách sẽ thấy đống gạch vụn và văng ra lỗi "Site can't be reached".
- **Nếu có lễ tân (Nginx/HAProxy):** Khách đến quầy lễ tân. Lễ tân sẽ nhìn vào danh sách và bảo: *"À, anh muốn dùng app Testing đúng không, mời anh đi theo lối này tới Port 8000"*.

## Trợ thủ đắc lực cho Zero-Downtime

Đây chính là lý do tại sao Nginx/HAProxy là "chìa khóa" bắt buộc phải có để bạn làm được task Blue-Green Deployment:

1. **Lúc bình thường (Blue):** Lễ tân đang dẫn tất cả traffic của QC vào phòng số **8000** (Bản cũ).
2. **Lúc Deploy:** Bạn (Dev) âm thầm xây một căn phòng mới ở số **8001** (Bản mới - Green). QC vẫn đang làm việc ở phòng 8000 bình thường, không hề hay biết.
3. **Lúc Switch Traffic (Chuyển đổi):** Bạn kiểm tra phòng 8001 đã ngon lành, bạn ra thì thầm vào tai Cô Lễ Tân: *"Từ giây phút này, ai vào web thì dẫn hết sang phòng 8001 nhé"*.
4. **Kết quả:** Cô Lễ Tân gật đầu (Reload cấu hình). Ngay lập tức, request tiếp theo của QC sẽ được dẫn sang phòng 8001. Quá trình này diễn ra trong chưa tới 1 phần ngàn giây. Trải nghiệm của QC không bị gián đoạn (Zero-Downtime).

## 3 Cái tên phổ biến nhất

- **Nginx (đọc là "Engine-X"):** Phổ biến nhất thế giới hiện nay. Nó cực kỳ nhẹ, nhanh và cấu hình rất dễ. Rất có khả năng môi trường Local/SIT của công ty bạn đang dùng công cụ này.
- **HAProxy:** Cũng rất nổi tiếng nhưng thường chuyên biệt hóa cho việc cân bằng tải (Load Balancing) chia đều traffic cho các hệ thống cực kỳ lớn (như ngân hàng, sàn thương mại).
- **Traefik:** Một công cụ rất hiện đại, sinh ra để chơi chung với Docker và Kubernetes. Điểm mạnh của nó là có thể "tự động" nhận diện căn phòng 8001 vừa được xây xong mà không cần ai phải ra thì thầm với nó.

---

**User:**
anh phụ trách quản lý task này của tôi yêu cầu tôi, hãy thử áp dụng zero-downtime deploy cho dự án riêng của tôi, và tôi đã có dự án riêng, bây giờ tôi nên áp dụng như thế nào

**AI:**
Yêu cầu của anh quản lý là một bước đi cực kỳ hợp lý và an toàn. Việc tự làm trên dự án cá nhân sẽ giúp bạn hiểu sâu tận gốc rễ vấn đề, thoải mái thử nghiệm mà không sợ làm "cháy" server của công ty.

Để bắt đầu, chúng ta hãy lấy dự án nhận diện biển báo giao thông SmartDrive.vn của bạn làm ví dụ thực hành. Với kiến trúc tách biệt rõ ràng (sử dụng FastAPI cho backend và React cho phần frontend), bạn nên ưu tiên áp dụng Zero-Downtime cho phần **Backend (FastAPI)** trước, vì đây thường là nơi dễ gây gián đoạn nhất khi cập nhật model hoặc logic.

Dưới đây là từng bước để bạn thiết lập Blue-Green Deployment ngay trên máy tính cá nhân (hoặc server cá nhân) của mình:

### 1. Chuẩn bị công cụ (Prerequisites)

Bạn sẽ cần dùng **Docker** để đóng gói ứng dụng và **Nginx** để làm "Cô Lễ Tân" (Reverse Proxy) điều hướng traffic.

### 2. Kịch bản thực hành từng bước

**Bước 1: Chạy phiên bản hiện tại (Blue - Port 8000)** Thay vì chạy trực tiếp `uvicorn`, bạn hãy bọc source code FastAPI của mình vào một Docker container và cho nó chạy ở cổng 8000.

- Lúc này, Backend SmartDrive.vn (Bản Blue) đang phục vụ bình thường ở `localhost:8000`.

**Bước 2: Cài đặt "Cô Lễ Tân" Nginx** Bạn thiết lập một Nginx server chạy ở cổng chính (ví dụ: cổng 80). Bạn cấu hình Nginx sao cho khi có request từ Frontend (React) gọi tới, Nginx sẽ tự động chuyển tiếp (proxy_pass) request đó vào `localhost:8000`.

- Trạng thái: Frontend gọi vào Nginx (Port 80) ➔ Nginx dẫn vào Blue (Port 8000).

**Bước 3: Deploy phiên bản mới song song (Green - Port 8001)** Giả sử bạn vừa cập nhật một model YOLO mới ra file ONNX và viết xong code API mới. Bạn tiến hành build một Docker container thứ hai (Bản Green) và cho nó chạy ở cổng 8001.

- Lúc này, bản Blue (8000) vẫn đang chạy và phục vụ request bình thường.
- Bản Green (8001) đã khởi động xong, kết nối Database thành công, nhưng chưa có ai truy cập.

**Bước 4: Health Check (Kiểm tra sức khỏe)** Bạn gọi thử API (ví dụ: `curl http://localhost:8001/health`) để đảm bảo bản Green trả về `200 OK` và sẵn sàng nhận diện biển báo.

**Bước 5: Switch Traffic (Chuyển đổi luồng không gián đoạn)** Bạn mở file cấu hình của Nginx, sửa dòng `localhost:8000` thành `localhost:8001`. Sau đó, bạn chạy lệnh reload Nginx (ví dụ: `nginx -s reload`). Nginx sẽ cập nhật cấu hình ngay lập tức mà không làm rớt các kết nối đang có.

- Trạng thái mới: Frontend gọi vào Nginx (Port 80) ➔ Nginx dẫn vào Green (Port 8001).
- Zero-Downtime thành công!

**Bước 6: Dọn dẹp (Cleanup)** Sau khi kiểm tra bản Green chạy mượt mà, bạn có thể tắt container Blue ở cổng 8000 để giải phóng RAM.

Bằng cách thực hành trơn tru luồng này trên máy mình, bạn sẽ dễ dàng áp dụng logic tương tự vào Jenkins Pipeline của công ty sau này.

Bạn có muốn tôi cung cấp mẫu file cấu hình `docker-compose.yml` và `nginx.conf` cơ bản để bạn có thể copy-paste và chạy thử luôn nghiệm ngay trên máy tính của mình không?

---

