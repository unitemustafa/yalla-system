package com.yallamarket.app

import android.content.ContentValues
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.webkit.MimeTypeMap
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.io.FileOutputStream

class MainActivity : FlutterActivity() {
    private val downloadsChannelName = "yallamarket/downloads"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            downloadsChannelName
        ).setMethodCallHandler { call, result ->
            if (call.method != "saveImageToDownloads") {
                result.notImplemented()
                return@setMethodCallHandler
            }

            val fileName = call.argument<String>("fileName") ?: "image.png"
            val bytes = call.argument<ByteArray>("bytes")
            if (bytes == null || bytes.isEmpty()) {
                result.success(false)
                return@setMethodCallHandler
            }

            try {
                result.success(saveImageToDownloads(fileName, bytes))
            } catch (_: Exception) {
                result.success(false)
            }
        }
    }

    private fun saveImageToDownloads(fileName: String, bytes: ByteArray): Boolean {
        val safeFileName = sanitizeFileName(fileName)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val values = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, safeFileName)
                put(MediaStore.MediaColumns.MIME_TYPE, mimeTypeFor(safeFileName))
                put(
                    MediaStore.MediaColumns.RELATIVE_PATH,
                    "${Environment.DIRECTORY_DOWNLOADS}/YallaMarket"
                )
                put(MediaStore.MediaColumns.IS_PENDING, 1)
            }

            val resolver = applicationContext.contentResolver
            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                ?: return false

            resolver.openOutputStream(uri)?.use { output ->
                output.write(bytes)
            } ?: return false

            values.clear()
            values.put(MediaStore.MediaColumns.IS_PENDING, 0)
            resolver.update(uri, values, null, null)
            return true
        }

        val downloads = Environment.getExternalStoragePublicDirectory(
            Environment.DIRECTORY_DOWNLOADS
        )
        val appDirectory = File(downloads, "YallaMarket")
        if (!appDirectory.exists() && !appDirectory.mkdirs()) return false

        FileOutputStream(uniqueFile(appDirectory, safeFileName)).use { output ->
            output.write(bytes)
        }
        return true
    }

    private fun sanitizeFileName(fileName: String): String {
        val cleaned = fileName
            .substringBefore("?")
            .replace(Regex("""[<>:"/\\|?*\u0000-\u001F]"""), "_")
            .trim()

        val baseName = cleaned.ifEmpty { "image.png" }
        return if (baseName.contains(".")) baseName else "$baseName.png"
    }

    private fun mimeTypeFor(fileName: String): String {
        val extension = fileName.substringAfterLast(".", "").lowercase()
        return MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)
            ?: "image/png"
    }

    private fun uniqueFile(directory: File, fileName: String): File {
        val first = File(directory, fileName)
        if (!first.exists()) return first

        val dotIndex = fileName.lastIndexOf(".")
        val stem = if (dotIndex > 0) fileName.substring(0, dotIndex) else fileName
        val extension = if (dotIndex > 0) fileName.substring(dotIndex) else ""
        var index = 1

        while (true) {
            val candidate = File(directory, "$stem-$index$extension")
            if (!candidate.exists()) return candidate
            index++
        }
    }
}
