# Atok App 2027 · Daily reward — Interactive demo

**Live demo:** https://duong2kvt.github.io/Atok-2027-Demo/

**Standalone HTML:** https://duong2kvt.github.io/Atok-2027-Demo/Atok-Daily-Reward-Demo.html

## Deploy trên cloud

GitHub Actions tự cài dependency từ lockfile, kiểm tra TypeScript, build và deploy lên GitHub Pages mỗi khi nhánh `main` thay đổi. Workflow nằm tại `.github/workflows/deploy-pages.yml`. Không cần build trên máy cá nhân. Source và assets được nhập từ thư mục `D:\Design\Atok 2027`; đây là bản demo dùng dữ liệu và thời gian giả lập, chưa có ví hoặc phần thưởng thật.

Bản demo tương tác (production-like) của tính năng **Daily reward / Check-in**, dựng từ Figma
`Atok App | 2027 → Home-Daily reward → Demo - 01`.

## Mở nhanh (không cần cài gì)

Mở file **`Atok-Daily-Reward-Demo.html`** bằng Chrome / Edge / Safari (double-click). Toàn bộ ảnh, font,
animation đã được đóng gói trong 1 file.

## Chạy source

```bash
npm install
npm run dev              # http://localhost:5173  (mở được cả trên điện thoại cùng mạng LAN)
npm run build            # build production vào dist/
npm run build:standalone # build lại file 1-trang trong dist-standalone/index.html
```

## Cách trình bày

| Khu vực | Mô tả |
| --- | --- |
| Điện thoại (phải) | App thật: Check-in → màn nhận thưởng → Collect → số dư tăng. Nút **Bonus** mở bottom sheet tương ứng từng lần check-in (kéo xuống / chạm nền để đóng). |
| Bảng điều khiển (trái) | **⏩ Bỏ qua thời gian chờ** (phím `N`), **Mô phỏng di chuyển** +1 km (`D`) / +4 km / tự động đi, **Nhảy nhanh** tới từng trạng thái, **Reset** (`R`) và tóm tắt logic. |

Trên màn hình điện thoại thật, bảng điều khiển nằm sau nút **Demo controls** ở cạnh phải.

Trạng thái được lưu trong trình duyệt (localStorage) nên refresh không mất tiến trình; bấm Reset để làm lại từ 07:00.

## Logic (theo note trong Figma)

- Daily reward bắt đầu lúc **07:00**, reset lúc 07:00 sáng hôm sau (đồng hồ ở góc card là thời gian còn lại).
- 3 lần check-in/ngày:
  1. **1st** — Avatar bonus · 0.1584 ATOK → chờ **4 tiếng**.
  2. **2nd** — Basic daily reward · 1.98 ATOK → bắt đầu đo quãng đường.
  3. **3rd** — Distance bonus: 4 km = 1%, 8 km = 2%, 12 km = 3% (× 1.98 ATOK). Mở khi đi đủ 4 km.

Mọi con số/quy tắc nằm ở `src/features/daily-reward/config.ts` để thử phương án khác nhanh.
Lần check-in thứ 3 chỉ cần đủ quãng đường, không có thời gian chờ 4 tiếng.

## Cấu trúc

```
src/
  features/daily-reward/
    config.ts          # số liệu & quy tắc
    engine.ts          # logic thuần (phase, phần thưởng, reset ngày) – dễ port sang backend
    store.tsx          # state + đồng hồ giả lập + điều khiển demo
    DailyRewardCard.tsx, DistanceTracker (trong card), RewardScreen.tsx, BonusSheet.tsx
  screens/HomeScreen.tsx
  components/          # StatusBar, Button, AnimatedNumber, AtokToken (motion xoay token)
  demo/DemoPanel.tsx   # bảng điều khiển cho buổi trình bày
  assets/              # asset xuất từ Figma
```

Stack: React 18 + TypeScript + Vite + Motion (motion.dev).
