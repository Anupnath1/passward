package com.passward.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "passwords")
data class PasswordEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val serviceName: String,
    val category: String, // website, app, email, wifi, financial, other
    val username: String,
    val encryptedPassword: ByteArray,
    val encryptedNotes: ByteArray? = null,
    val url: String = "",
    val isFavorite: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
