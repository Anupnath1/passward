package com.savemypassword.app.security

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class CryptoManager {

    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply {
        load(null)
    }

    companion object {
        private const val ALGORITHM = KeyProperties.KEY_ALGORITHM_AES
        private const val BLOCK_MODE = KeyProperties.BLOCK_MODE_GCM
        private const val PADDING = KeyProperties.ENCRYPTION_PADDING_NONE
        private const val TRANSFORMATION = "$ALGORITHM/$BLOCK_MODE/$PADDING"
        private const val KEY_ALIAS = "save_my_password_master_key_v1"
        private const val TAG_LENGTH_BITS = 128
        private const val IV_SIZE_BYTES = 12
    }

    private fun getOrCreateKey(): SecretKey {
        val existingKey = keyStore.getEntry(KEY_ALIAS, null) as? KeyStore.SecretKeyEntry
        return existingKey?.secretKey ?: createKey()
    }

    private fun createKey(): SecretKey {
        return KeyGenerator.getInstance(ALGORITHM, "AndroidKeyStore").apply {
            init(
                KeyGenParameterSpec.Builder(
                    KEY_ALIAS,
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                )
                    .setBlockModes(BLOCK_MODE)
                    .setEncryptionPaddings(PADDING)
                    .setKeySize(256)
                    .setUserAuthenticationRequired(false)
                    .setRandomizedEncryptionRequired(true)
                    .build()
            )
        }.generateKey()
    }

    fun encrypt(bytes: ByteArray): ByteArray {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())
        val iv = cipher.iv
        val encryptedBytes = cipher.doFinal(bytes)

        val outputStream = ByteArrayOutputStream()
        outputStream.write(iv)
        outputStream.write(encryptedBytes)
        return outputStream.toByteArray()
    }

    fun decrypt(encryptedBytesWithIv: ByteArray): ByteArray {
        if (encryptedBytesWithIv.size <= IV_SIZE_BYTES) {
            throw IllegalArgumentException("Invalid encrypted payload size")
        }

        val inputStream = ByteArrayInputStream(encryptedBytesWithIv)
        val iv = ByteArray(IV_SIZE_BYTES)
        inputStream.read(iv)
        val ciphertext = inputStream.readBytes()

        val cipher = Cipher.getInstance(TRANSFORMATION)
        val spec = GCMParameterSpec(TAG_LENGTH_BITS, iv)
        cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey(), spec)

        return cipher.doFinal(ciphertext)
    }

    fun encryptString(plainText: String): ByteArray {
        return encrypt(plainText.toByteArray(Charsets.UTF_8))
    }

    fun decryptToString(encryptedBytes: ByteArray): String {
        return String(decrypt(encryptedBytes), Charsets.UTF_8)
    }
}
