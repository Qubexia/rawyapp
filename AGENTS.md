# rawyapp Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-08

## Active Technologies
- TypeScript 5.7.3 + NestJS 11.x (backend), Next.js 14 (frontend), React 18, TanStack Query, Axios (006-podcast-episode-management)
- MongoDB with Mongoose ODM (006-podcast-episode-management)
- TypeScript 5.7.3 (backend), TypeScript 5.9.2 (mobile), TypeScript 5.x (admin dashboard) + NestJS 11.x (backend), Expo SDK 54 / React Native 0.81.5 (mobile), Next.js 14.2 (admin dashboard), Mongoose 9.2, expo-audio 1.1 (playback AND recording via useAudioRecorder) (009-podcast-edit-record)
- MongoDB (Mongoose ODM), local filesystem for audio/image uploads (`./uploads/audio`, `./uploads/images`), 100MB file size limit (009-podcast-edit-record)
- TypeScript 5.7.3 (backend), TypeScript 5.9.2 (mobile) + NestJS 11.x (backend), Expo SDK 54 / React Native 0.81.5 (mobile), Mongoose 9.2 (011-podcast-hybrid-platform)
- TypeScript 5.7.3 + NestJS 11.x, Mongoose 9.2, Jest (011-podcast-hybrid-platform)
- MongoDB with Mongoose ODM (existing) (011-podcast-hybrid-platform)
- TypeScript 5.7.3 + NestJS 11.x, Mongoose 9.2, Nodemailer (012-otp-email-auth)

- TypeScript 5.7.3 + Next.js 14 (frontend), NestJS 11.x (backend), React 18, TanStack Query, Axios (005-d-projects-rawyapp)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.7.3: Follow standard conventions

## Recent Changes
- 012-otp-email-auth: Added TypeScript 5.7.3 + NestJS 11.x, Mongoose 9.2, Nodemailer
- 011-podcast-hybrid-platform: Added TypeScript 5.7.3 + NestJS 11.x, Mongoose 9.2, Jest
- 011-podcast-hybrid-platform: Added TypeScript 5.7.3 (backend), TypeScript 5.9.2 (mobile) + NestJS 11.x (backend), Expo SDK 54 / React Native 0.81.5 (mobile), Mongoose 9.2


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
