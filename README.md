# EventHub

## Review & persistence updates
- All logged-in customers, organizers and admins can open an event's Reviews page and view all reviews for that event.
- Customers can post reviews. Reviews are saved through JSON Server in `db.json`.
- Logged-in users can like/unlike reviews. The like count and each user's `likedBy` entry are saved in `db.json`.
- The organizer who owns an event can reply to its reviews. Replies are saved in `db.json` and are visible to customers, organizers and admins.
- Adding or editing an event records `createdAt` / `updatedAt` and persists the event through the existing JSON Server API.
- Event rating is recalculated and saved when a new review is posted.
- Light/dark theme preference remains stored in browser `localStorage`.

## Run locally

Terminal 1:
```bash
npm install
npm run server
```

Terminal 2:
```bash
npm run dev
```

Keep the JSON Server running while using the app so review likes, replies, bookings and event changes are written to `db.json`.
