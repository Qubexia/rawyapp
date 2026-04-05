# Mobile Frontend API Schemas Guide (Hybrid Podcasts)

This document serves as the data contract guidelines for the mobile team consuming endpoints from Phase 3 & 4. 
The backend has standardized the error response envelopes through a global filter as follows:

## Standard Error Response Payload
When the API fails (e.g. `401 Unauthorized`, `403 Forbidden`, `404 Not Found`), the mobile client should expect errors in the following consistent schema:
```json
{
  "statusCode": 401,
  "message": "Unauthorized or detailed error reason here",
  "error": "Error title (e.g. Unauthorized, Not Found)",
  "timestamp": "2026-04-05T00:00:00.000Z",
  "path": "/api/v1/podcasts/claim"
}
```

## DTO Expected Shapes

### `GET /podcasts/discover` and `GET /podcasts/search?q=`
The backend directly pipes generic parsed data from Apple into this common schema layout for seamless UI rendering on mobile.
```typescript
interface DiscoverPodcast {
  id: string; // Used strictly if needed for cross-references
  title: string;
  description: string;
  feedUrl: string; // Critical for RSS retrieval if subscribed
  artworkUrl: string; // Typically high-res (e.g. 600x600)
  author: string;
  appleId: string; // Important for claiming
}

// API Returns:
interface DiscoverResponse {
  statusCode: 200;
  data: DiscoverPodcast[];
}
```

### `POST /podcasts/claim`
This endpoint triggers the backend `ClaimsService` to start tracking a verification token.
**Request Body**:
```typescript
interface RequestClaimDto {
  podcastId: string; // This corresponds to the appleId or internal DB id
}
```
**Response Payload**:
```typescript
interface RequestClaimResponse {
  statusCode: 202;
  message: "Verification email sent";
  claimId: string; // Mongo ObjectId mapping to the tracking claim
}
```

### `GET /claims/verify/:token`
Triggered typically when the user clicks a verification email link.
**Response Payload (On Success)**:
```typescript
interface VerifyClaimResponse {
  statusCode: 200;
  message: "Podcast claimed successfully";
  role: "CREATOR"; // System auto-upgrades upon completion
}
```

## Ownership Guard Warning
Mobile team should ensure the active user has the `CREATOR` role before revealing Creator dashboard tabs. Furthermore, the backend `OwnershipGuard` explicitly double-checks on server-side that incoming requests to mutate resources (like uploading an episode via `EpisodesController`) are performed by the creator who actually owns the target `podcastId`.
