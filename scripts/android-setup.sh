#!/usr/bin/env bash
# Erzeugt das Android-Projekt (android/) und setzt Querformat + Vollbild. Danach: cd android && ./gradlew assembleDebug
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build:www
[ -d android ] || npx cap add android
npx cap sync android
M=android/app/src/main/AndroidManifest.xml
grep -q screenOrientation "$M" || sed -i 's/<activity$/<activity android:screenOrientation="sensorLandscape"/' "$M"
S=android/app/src/main/res/values/styles.xml
grep -q windowFullscreen "$S" || sed -i 's#</style>#    <item name="android:windowFullscreen">true</item>\n    </style>#' "$S" || true
echo "Android-Projekt bereit. APK: cd android && ./gradlew assembleDebug  (Ausgabe: android/app/build/outputs/apk/debug/)"
