# App Store Deployment Guide

## Prerequisites

### Android
- Google Play Console account
- Keystore file for signing
- Privacy policy URL
- App screenshots and promotional graphics

### iOS
- Apple Developer Account
- App Store Connect access
- Certificates and provisioning profiles
- App screenshots for different devices

## Android Deployment

### 1. Generate Release Keystore
```bash
keytool -genkey -v -keystore agrilink.keystore -alias agrilink -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Gradle Properties
Create/update `android/gradle.properties`:
```properties
AGRILINK_UPLOAD_STORE_FILE=agrilink.keystore
AGRILINK_UPLOAD_KEY_ALIAS=agrilink
AGRILINK_UPLOAD_STORE_PASSWORD=*****
AGRILINK_UPLOAD_KEY_PASSWORD=*****
```

### 3. Build Release APK/Bundle
```bash
cd frontend/mobile/android
./gradlew bundleRelease
```
The AAB file will be in `android/app/build/outputs/bundle/release/`

### 4. Testing Release Build
```bash
# Install release version
npx react-native run-android --variant=release

# Generate APK for testing
./gradlew assembleRelease
```

## iOS Deployment

### 1. Configure Xcode Project
- Update version and build numbers
- Configure signing certificates
- Set up app capabilities

### 2. Create Archive
```bash
cd frontend/mobile/ios
xcodebuild -workspace AgriLink.xcworkspace -scheme AgriLink archive -archivePath AgriLink.xcarchive
```

### 3. Export IPA
```bash
xcodebuild -exportArchive -archivePath AgriLink.xcarchive -exportOptionsPlist ExportOptions.plist -exportPath ./build
```

## Automated Deployment

### 1. Fastlane Setup
Install fastlane:
```bash
cd frontend/mobile
gem install fastlane
fastlane init
```

### 2. Configure Fastlane

Create `frontend/mobile/fastlane/Fastfile`:
```ruby
platform :android do
  desc "Deploy to Play Store"
  lane :deploy do
    gradle(
      task: 'bundle',
      build_type: 'Release'
    )
    upload_to_play_store(
      track: 'internal',
      aab: '../android/app/build/outputs/bundle/release/app-release.aab'
    )
  end
end

platform :ios do
  desc "Deploy to App Store"
  lane :deploy do
    build_ios_app(
      scheme: "AgriLink",
      export_method: "app-store"
    )
    upload_to_app_store(
      skip_screenshots: true,
      skip_metadata: true
    )
  end
end
```

### 3. CI/CD Integration

Add to `.github/workflows/mobile-deploy.yml`:
```yaml
name: Mobile App Deployment

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '2.7'
      - name: Install Fastlane
        run: gem install fastlane
      - name: Deploy to Play Store
        env:
          PLAY_STORE_CONFIG_JSON: ${{ secrets.PLAY_STORE_CONFIG_JSON }}
        run: |
          cd frontend/mobile
          fastlane android deploy

  deploy-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '2.7'
      - name: Install Fastlane
        run: gem install fastlane
      - name: Deploy to App Store
        env:
          APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
        run: |
          cd frontend/mobile
          fastlane ios deploy
```

## Store Listings

### Google Play Store
1. App Information
   - Title: AgriLink - Agri Supply Chain
   - Short Description: Optimize your agricultural supply chain
   - Full Description: [See marketing/play-store-description.txt]
   - Category: Business

2. Required Content
   - Privacy Policy URL
   - App Icon (512x512)
   - Feature Graphic (1024x500)
   - Screenshots (minimum 2)
   - Content Rating Questionnaire

### App Store
1. App Information
   - Name: AgriLink
   - Subtitle: Agri Supply Chain Platform
   - Category: Business
   - Privacy Policy URL

2. Required Content
   - App Icon
   - Screenshots for:
     - iPhone 6.5" Display
     - iPhone 5.5" Display
     - iPad 12.9" Display
   - App Preview Videos (optional)

## Version Management

### Semantic Versioning
- MAJOR.MINOR.PATCH (e.g., 1.0.0)
- Increment appropriately based on changes

### Release Process
1. Update version numbers
   ```bash
   # Android: android/app/build.gradle
   versionCode 1
   versionName "1.0.0"
   
   # iOS: ios/AgriLink/Info.plist
   CFBundleShortVersionString -> "1.0.0"
   CFBundleVersion -> "1"
   ```

2. Create git tag
   ```bash
   git tag -a v1.0.0 -m "Version 1.0.0"
   git push origin v1.0.0
   ```

## Post-Deployment
1. Monitor crash reports
2. Track user feedback
3. Respond to reviews
4. Plan updates based on metrics 