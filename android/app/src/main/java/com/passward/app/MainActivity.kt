package com.passward.app

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.fragment.app.FragmentActivity
import com.passward.app.security.BiometricAuthManager
import com.passward.app.security.CryptoManager
import com.passward.app.ui.VaultApp
import com.passward.app.ui.theme.PasswardTheme

class MainActivity : FragmentActivity() {

    private lateinit var biometricAuthManager: BiometricAuthManager
    private val cryptoManager = CryptoManager()

    // State: whether the vault is currently unlocked by the device owner
    private val isUnlocked = mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // SECURITY: Prevent screenshots, screen recording, and task switcher previews!
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )

        enableEdgeToEdge()
        biometricAuthManager = BiometricAuthManager(this)

        setContent {
            val systemDark = androidx.compose.foundation.isSystemInDarkTheme()
            val isDarkThemeState = androidx.compose.runtime.remember { mutableStateOf<Boolean?>(null) }
            val currentDark = isDarkThemeState.value ?: systemDark

            PasswardTheme(darkTheme = currentDark) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    VaultApp(
                        isUnlocked = isUnlocked.value,
                        onRequestUnlock = { promptUnlock() },
                        onLockVault = { isUnlocked.value = false },
                        cryptoManager = cryptoManager,
                        isDarkTheme = currentDark,
                        onToggleTheme = {
                            isDarkThemeState.value = !currentDark
                        }
                    )
                }
            }
        }

        // Prompt biometric auth upon launch
        promptUnlock()
    }

    override fun onPause() {
        super.onPause()
        // Auto-lock whenever app goes into background or recents
        isUnlocked.value = false
    }

    private fun promptUnlock() {
        biometricAuthManager.showBiometricPrompt(
            title = "Unlock Passward",
            subtitle = "Biometric or Device PIN required to view passwords",
            onSuccess = {
                isUnlocked.value = true
            },
            onError = { _ ->
                isUnlocked.value = false
            }
        )
    }
}
