#!/bin/sh
echo "Cleaning ..."
rm -rf platforms/android/build:
echo "Building ..."
ionic build --release --info android
echo "Signing ..."
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/Dev/Android\ Keystore/b-alidra.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk com.b-alidra.lychee
echo "Aligning ..."
~/Library/Android/sdk/build-tools/23.0.2/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk platforms/android/build/outputs/apk/Lychee.apk
echo "Uploading app ..."
scp platforms/android/build/outputs/apk/Lychee.apk root@server:/home/apps/www
echo "Done !!! Check http:///apps.b-alidra.com/Lychee.apk"
