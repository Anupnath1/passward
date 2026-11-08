package com.passward.app.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.passward.app.data.AppDatabase
import com.passward.app.data.PasswordEntity
import com.passward.app.security.CryptoManager
import kotlinx.coroutines.launch
import kotlin.random.Random

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VaultApp(
    isUnlocked: Boolean,
    onRequestUnlock: () -> Unit,
    onLockVault: () -> Unit,
    cryptoManager: CryptoManager,
    isDarkTheme: Boolean = false,
    onToggleTheme: () -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val db = remember { AppDatabase.getDatabase(context) }
    val passwordDao = db.passwordDao()

    val passwordsFlow by passwordDao.getAllPasswords().collectAsState(initial = emptyList())
    var searchQuery by remember { mutableStateOf("") }
    var showFavoritesOnly by remember { mutableStateOf(false) }
    var showMenuDropdown by remember { mutableStateOf(false) }

    // Dialog States
    var showBackupDialog by remember { mutableStateOf(false) }
    var showAuditDialog by remember { mutableStateOf(false) }
    var showGeneratorDialog by remember { mutableStateOf(false) }
    var showSettingsDialog by remember { mutableStateOf(false) }
    var showAddDialog by remember { mutableStateOf(false) }
    var editingPassword by remember { mutableStateOf<PasswordEntity?>(null) }
    var viewingPassword by remember { mutableStateOf<PasswordEntity?>(null) }

    if (!isUnlocked) {
        // Biometric Lock Screen
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(18.dp),
                modifier = Modifier.padding(24.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Fingerprint,
                        contentDescription = "Biometric Lock",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(56.dp)
                    )
                }

                Text(
                    text = "Passward",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )

                Text(
                    text = "Personal offline vault is locked",
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.outline
                )

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = onRequestUnlock,
                    shape = RoundedCornerShape(24.dp),
                    contentPadding = PaddingValues(horizontal = 24.dp, vertical = 14.dp)
                ) {
                    Icon(imageVector = Icons.Default.LockOpen, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Unlock Vault (Biometric / PIN)")
                }
            }
        }
    } else {
        // Vault Dashboard Screen
        val filteredPasswords = remember(passwordsFlow, searchQuery, showFavoritesOnly) {
            passwordsFlow.filter { item ->
                val matchesFavorite = !showFavoritesOnly || item.isFavorite
                val matchesSearch = searchQuery.isBlank() ||
                        item.serviceName.contains(searchQuery, ignoreCase = true) ||
                        item.username.contains(searchQuery, ignoreCase = true) ||
                        item.url.contains(searchQuery, ignoreCase = true)
                matchesFavorite && matchesSearch
            }
        }

        Scaffold(
            topBar = {
                TopAppBar(
                    navigationIcon = {
                        Box {
                            IconButton(onClick = { showMenuDropdown = true }) {
                                Icon(
                                    imageVector = Icons.Default.Menu,
                                    contentDescription = "Menu (☰)",
                                    modifier = Modifier.size(24.dp)
                                )
                            }

                            DropdownMenu(
                                expanded = showMenuDropdown,
                                onDismissRequest = { showMenuDropdown = false },
                                modifier = Modifier.width(260.dp)
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Backup & Restore", fontWeight = FontWeight.SemiBold) },
                                    leadingIcon = {
                                        Icon(Icons.Default.Folder, contentDescription = null, tint = Color(0xFF6366F1))
                                    },
                                    onClick = {
                                        showMenuDropdown = false
                                        showBackupDialog = true
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Security Health Audit", fontWeight = FontWeight.SemiBold) },
                                    leadingIcon = {
                                        Icon(Icons.Default.Security, contentDescription = null, tint = Color(0xFF10B981))
                                    },
                                    onClick = {
                                        showMenuDropdown = false
                                        showAuditDialog = true
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Password Generator", fontWeight = FontWeight.SemiBold) },
                                    leadingIcon = {
                                        Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color(0xFF818CF8))
                                    },
                                    onClick = {
                                        showMenuDropdown = false
                                        showGeneratorDialog = true
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text(if (isDarkTheme) "Switch to Light Theme" else "Switch to Dark Theme", fontWeight = FontWeight.SemiBold) },
                                    leadingIcon = {
                                        Icon(
                                            if (isDarkTheme) Icons.Default.LightMode else Icons.Default.DarkMode,
                                            contentDescription = null,
                                            tint = if (isDarkTheme) Color(0xFFFBBF24) else Color(0xFF6366F1)
                                        )
                                    },
                                    onClick = {
                                        showMenuDropdown = false
                                        onToggleTheme()
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Vault Settings", fontWeight = FontWeight.SemiBold) },
                                    leadingIcon = {
                                        Icon(Icons.Default.Settings, contentDescription = null)
                                    },
                                    onClick = {
                                        showMenuDropdown = false
                                        showSettingsDialog = true
                                    }
                                )
                                HorizontalDivider()
                                DropdownMenuItem(
                                    text = { Text("Lock Vault Now", fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B)) },
                                    leadingIcon = {
                                        Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFFF59E0B))
                                    },
                                    onClick = {
                                        showMenuDropdown = false
                                        onLockVault()
                                    }
                                )
                            }
                        }
                    },
                    title = {
                        Column {
                            Text("Passward", fontWeight = FontWeight.Black, fontSize = 22.sp, letterSpacing = (-0.5).sp)
                            Text(
                                "${passwordsFlow.size} credentials · Encrypted Vault",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.outline
                            )
                        }
                    },
                    actions = {
                        // Quick Lock Button
                        IconButton(onClick = onLockVault) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "Lock Now",
                                tint = Color(0xFFF59E0B),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                )
            },
            floatingActionButton = {
                FloatingActionButton(
                    onClick = { showAddDialog = true },
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add Password")
                }
            }
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 16.dp)
            ) {
                // Search Input Bar & Favorite Filter
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Search services, usernames, notes...") },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Default.Clear, contentDescription = "Clear")
                                }
                            }
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    IconButton(
                        onClick = { showFavoritesOnly = !showFavoritesOnly },
                        modifier = Modifier
                            .size(52.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                if (showFavoritesOnly) Color(0xFFF59E0B).copy(alpha = 0.15f)
                                else MaterialTheme.colorScheme.surfaceVariant
                            )
                    ) {
                        Icon(
                            imageVector = if (showFavoritesOnly) Icons.Default.Star else Icons.Default.StarBorder,
                            contentDescription = "Filter Favorites",
                            tint = if (showFavoritesOnly) Color(0xFFF59E0B) else MaterialTheme.colorScheme.outline
                        )
                    }
                }

                if (filteredPasswords.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(bottom = 60.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Icon(
                                Icons.Default.Key,
                                contentDescription = null,
                                modifier = Modifier.size(48.dp),
                                tint = MaterialTheme.colorScheme.outline
                            )
                            Text(
                                if (searchQuery.isNotBlank()) "No matching passwords found" else "Vault is empty",
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                            Text(
                                "Tap + to add your first encrypted credential",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.outline
                            )

                            if (passwordsFlow.isEmpty()) {
                                OutlinedButton(
                                    onClick = {
                                        coroutineScope.launch {
                                            // Seed initial demo passwords
                                            val samples = listOf(
                                                Triple("Google Account", "personal@gmail.com", "P@ssw0rd!Google2026"),
                                                Triple("GitHub", "developer", "ghp_SecureDevPass2026!"),
                                                Triple("Home Wi-Fi", "Router-5G", "SuperSecretWifi9876"),
                                                Triple("Netflix", "family@netflix.com", "StreamChill#2026")
                                            )
                                            samples.forEach { (svc, user, pass) ->
                                                passwordDao.insertPassword(
                                                    PasswordEntity(
                                                        serviceName = svc,
                                                        username = user,
                                                        category = if (svc.contains("Wi-Fi")) "wifi" else "website",
                                                        encryptedPassword = cryptoManager.encryptString(pass),
                                                        isFavorite = svc.contains("Google")
                                                    )
                                                )
                                            }
                                            Toast.makeText(context, "Sample passwords loaded!", Toast.LENGTH_SHORT).show()
                                        }
                                    },
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Icon(Icons.Default.AddCircleOutline, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Load Sample Passwords")
                                }
                            }
                        }
                    }
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(bottom = 80.dp)
                    ) {
                        items(filteredPasswords, key = { it.id }) { item ->
                            PasswordItemCard(
                                item = item,
                                cryptoManager = cryptoManager,
                                onClick = { viewingPassword = item },
                                onEdit = { editingPassword = item },
                                onToggleFavorite = {
                                    coroutineScope.launch {
                                        passwordDao.updatePassword(item.copy(isFavorite = !item.isFavorite))
                                    }
                                },
                                onDelete = {
                                    coroutineScope.launch {
                                        passwordDao.deletePassword(item)
                                        Toast.makeText(context, "Password deleted", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }

        // ==========================================
        // EDIT PASSWORD MODAL
        // ==========================================
        if (editingPassword != null) {
            val item = editingPassword!!
            val initialPass = remember(item.id) {
                try {
                    cryptoManager.decryptToString(item.encryptedPassword)
                } catch (_: Exception) {
                    ""
                }
            }
            EditPasswordDialog(
                item = item,
                initialPassword = initialPass,
                onDismiss = { editingPassword = null },
                onSave = { service, user, pass, cat, url ->
                    coroutineScope.launch {
                        val encryptedPass = cryptoManager.encryptString(pass)
                        passwordDao.updatePassword(
                            item.copy(
                                serviceName = service,
                                username = user,
                                category = cat,
                                url = url,
                                encryptedPassword = encryptedPass,
                                updatedAt = System.currentTimeMillis()
                            )
                        )
                        editingPassword = null
                        Toast.makeText(context, "Password updated successfully!", Toast.LENGTH_SHORT).show()
                    }
                }
            )
        }

        // ==========================================
        // VIEW PASSWORD DETAIL MODAL
        // ==========================================
        if (viewingPassword != null) {
            val item = viewingPassword!!
            PasswordDetailDialog(
                item = item,
                cryptoManager = cryptoManager,
                onDismiss = { viewingPassword = null },
                onEdit = {
                    val target = viewingPassword
                    viewingPassword = null
                    editingPassword = target
                },
                onDelete = {
                    coroutineScope.launch {
                        passwordDao.deletePassword(item)
                        viewingPassword = null
                        Toast.makeText(context, "Password deleted", Toast.LENGTH_SHORT).show()
                    }
                }
            )
        }

        // 1. BACKUP & RESTORE MODAL
        if (showBackupDialog) {
            BackupRestoreDialog(
                passwords = passwordsFlow,
                cryptoManager = cryptoManager,
                onDismiss = { showBackupDialog = false },
                onRestoreItem = { service, user, pass, cat ->
                    coroutineScope.launch {
                        val encryptedPass = cryptoManager.encryptString(pass)
                        passwordDao.insertPassword(
                            PasswordEntity(
                                serviceName = service,
                                username = user,
                                category = cat,
                                encryptedPassword = encryptedPass
                            )
                        )
                    }
                }
            )
        }

        // 2. SECURITY HEALTH AUDIT MODAL
        if (showAuditDialog) {
            SecurityAuditDialog(
                passwords = passwordsFlow,
                cryptoManager = cryptoManager,
                onDismiss = { showAuditDialog = false },
                onFixPassword = { flaggedEntity ->
                    showAuditDialog = false
                    editingPassword = flaggedEntity
                }
            )
        }

        // 3. STANDALONE PASSWORD GENERATOR MODAL
        if (showGeneratorDialog) {
            StandalonePasswordGeneratorDialog(
                onDismiss = { showGeneratorDialog = false }
            )
        }

        // 4. SETTINGS MODAL
        if (showSettingsDialog) {
            SettingsDialog(
                totalCredentials = passwordsFlow.size,
                isDarkTheme = isDarkTheme,
                onToggleTheme = onToggleTheme,
                onDismiss = { showSettingsDialog = false },
                onWipeAll = {
                    coroutineScope.launch {
                        passwordDao.deleteAllPasswords()
                        showSettingsDialog = false
                        Toast.makeText(context, "All passwords permanently erased", Toast.LENGTH_LONG).show()
                    }
                }
            )
        }

        // Add Password Modal
        if (showAddDialog) {
            AddPasswordDialog(
                onDismiss = { showAddDialog = false },
                onSave = { service, user, pass, cat, url ->
                    coroutineScope.launch {
                        val encryptedPass = cryptoManager.encryptString(pass)
                        passwordDao.insertPassword(
                            PasswordEntity(
                                serviceName = service,
                                username = user,
                                category = cat,
                                url = url,
                                encryptedPassword = encryptedPass
                            )
                        )
                        showAddDialog = false
                        Toast.makeText(context, "Password securely saved", Toast.LENGTH_SHORT).show()
                    }
                }
            )
        }
    }
}

// ==========================================
// EDIT PASSWORD DIALOG
// ==========================================
@Composable
fun EditPasswordDialog(
    item: PasswordEntity,
    initialPassword: String,
    onDismiss: () -> Unit,
    onSave: (service: String, user: String, pass: String, category: String, url: String) -> Unit
) {
    var serviceName by remember { mutableStateOf(item.serviceName) }
    var username by remember { mutableStateOf(item.username) }
    var password by remember { mutableStateOf(initialPassword) }
    var category by remember { mutableStateOf(item.category) }
    var url by remember { mutableStateOf(item.url) }
    var isPasswordVisible by remember { mutableStateOf(false) }

    val categories = listOf("website", "app", "email", "wifi", "financial", "other")

    fun generateRandomPassword(): String {
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
        return (1..16).map { chars[Random.nextInt(chars.length)] }.joinToString("")
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.Edit, contentDescription = null, tint = Color(0xFF6366F1))
                Text("Edit Password", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = serviceName,
                    onValueChange = { serviceName = it },
                    label = { Text("Service / Account Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("Username / Email") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        Row {
                            IconButton(onClick = { password = generateRandomPassword() }) {
                                Icon(Icons.Default.AutoAwesome, contentDescription = "Generate New", tint = Color(0xFF818CF8))
                            }
                            IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                                Icon(
                                    if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = null
                                )
                            }
                        }
                    }
                )

                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it },
                    label = { Text("Website URL (Optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (serviceName.isNotBlank() && password.isNotBlank()) {
                        onSave(serviceName.trim(), username.trim(), password.trim(), category, url.trim())
                    }
                },
                enabled = serviceName.isNotBlank() && password.isNotBlank()
            ) {
                Text("Save Changes")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

// ==========================================
// PASSWORD DETAIL VIEW DIALOG
// ==========================================
@Composable
fun PasswordDetailDialog(
    item: PasswordEntity,
    cryptoManager: CryptoManager,
    onDismiss: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val context = LocalContext.current
    var isPasswordVisible by remember { mutableStateOf(false) }
    var decryptedPassword by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(item.id) {
        try {
            decryptedPassword = cryptoManager.decryptToString(item.encryptedPassword)
        } catch (_: Exception) {
            decryptedPassword = "Error decrypting"
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(item.serviceName, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Text("OFFLINE CREDENTIAL", fontSize = 11.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                }
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit Password", tint = Color(0xFF6366F1))
                }
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Username Card
                ElevatedCard(shape = RoundedCornerShape(12.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Username / Login", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                            Text(item.username, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                        }
                        IconButton(onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("username", item.username))
                            Toast.makeText(context, "Username copied!", Toast.LENGTH_SHORT).show()
                        }) {
                            Icon(Icons.Default.ContentCopy, contentDescription = "Copy Username", modifier = Modifier.size(18.dp))
                        }
                    }
                }

                // Password Card
                ElevatedCard(shape = RoundedCornerShape(12.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Encrypted Password", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                            Text(
                                text = if (isPasswordVisible) (decryptedPassword ?: "••••••••") else "••••••••",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        Row {
                            IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                                Icon(
                                    if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = "Toggle",
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                            IconButton(onClick = {
                                val pwd = decryptedPassword ?: ""
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                clipboard.setPrimaryClip(ClipData.newPlainText("password", pwd))
                                Toast.makeText(context, "Password copied to clipboard!", Toast.LENGTH_SHORT).show()
                            }) {
                                Icon(Icons.Default.ContentCopy, contentDescription = "Copy", modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }

                if (item.url.isNotBlank()) {
                    ElevatedCard(shape = RoundedCornerShape(12.dp)) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Website URL", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                                Text(item.url, fontSize = 13.sp, color = MaterialTheme.colorScheme.primary)
                            }
                            IconButton(onClick = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                clipboard.setPrimaryClip(ClipData.newPlainText("url", item.url))
                                Toast.makeText(context, "URL copied!", Toast.LENGTH_SHORT).show()
                            }) {
                                Icon(Icons.Default.ContentCopy, contentDescription = "Copy URL", modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = onEdit) {
                Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Edit")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDelete,
                colors = ButtonDefaults.textButtonColors(contentColor = Color(0xFFEF4444))
            ) {
                Icon(Icons.Default.DeleteOutline, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Delete")
            }
        }
    )
}

// ==========================================
// 1. BACKUP & RESTORE MODAL (FolderArchive)
// ==========================================
@Composable
fun BackupRestoreDialog(
    passwords: List<PasswordEntity>,
    cryptoManager: CryptoManager,
    onDismiss: () -> Unit,
    onRestoreItem: (service: String, user: String, pass: String, category: String) -> Unit
) {
    val context = LocalContext.current
    var importText by remember { mutableStateOf("") }
    var showImportField by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.Folder, contentDescription = null, tint = Color(0xFF6366F1))
                Text("Backup & Restore", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Export your encrypted passwords to keep a local backup, or restore an existing backup file.",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.outline
                )

                ElevatedCard(shape = RoundedCornerShape(14.dp)) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Export Local Backup", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(
                            "${passwords.size} credentials ready to export",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.outline
                        )
                        Button(
                            onClick = {
                                try {
                                    val sb = StringBuilder()
                                    sb.append("[\n")
                                    passwords.forEachIndexed { index, p ->
                                        val decrypted = try { cryptoManager.decryptToString(p.encryptedPassword) } catch (_: Exception) { "" }
                                        sb.append("  {\"service\":\"${p.serviceName}\",\"user\":\"${p.username}\",\"pass\":\"$decrypted\",\"cat\":\"${p.category}\"}")
                                        if (index < passwords.size - 1) sb.append(",")
                                        sb.append("\n")
                                    }
                                    sb.append("]")

                                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(Intent.EXTRA_SUBJECT, "Passward_Backup_${System.currentTimeMillis()}.json")
                                        putExtra(Intent.EXTRA_TEXT, sb.toString())
                                    }
                                    context.startActivity(Intent.createChooser(shareIntent, "Save or Share Vault Backup"))
                                } catch (_: Exception) {
                                    Toast.makeText(context, "Export error", Toast.LENGTH_SHORT).show()
                                }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Export Backup JSON")
                        }
                    }
                }

                ElevatedCard(shape = RoundedCornerShape(14.dp)) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Restore From Backup", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        if (!showImportField) {
                            OutlinedButton(
                                onClick = { showImportField = true },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.Upload, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Import / Paste JSON")
                            }
                        } else {
                            OutlinedTextField(
                                value = importText,
                                onValueChange = { importText = it },
                                placeholder = { Text("Paste JSON backup array here...") },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(100.dp),
                                textStyle = LocalTextStyle.current.copy(fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                            )
                            Button(
                                onClick = {
                                    try {
                                        var restoredCount = 0
                                        val pattern = Regex("""\{"service":"(.*?)","user":"(.*?)","pass":"(.*?)","cat":"(.*?)"\}""")
                                        pattern.findAll(importText).forEach { match ->
                                            val (svc, user, pass, cat) = match.destructured
                                            onRestoreItem(svc, user, pass, cat)
                                            restoredCount++
                                        }
                                        if (restoredCount > 0) {
                                            Toast.makeText(context, "Restored $restoredCount passwords!", Toast.LENGTH_SHORT).show()
                                            onDismiss()
                                        } else {
                                            Toast.makeText(context, "No valid records found in JSON", Toast.LENGTH_SHORT).show()
                                        }
                                    } catch (_: Exception) {
                                        Toast.makeText(context, "Failed to parse JSON backup", Toast.LENGTH_SHORT).show()
                                    }
                                },
                                modifier = Modifier.fillMaxWidth(),
                                enabled = importText.isNotBlank()
                            ) {
                                Text("Restore Passwords")
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}

// ==========================================
// 2. SECURITY HEALTH AUDIT MODAL (ShieldCheck)
// ==========================================
@Composable
fun SecurityAuditDialog(
    passwords: List<PasswordEntity>,
    cryptoManager: CryptoManager,
    onDismiss: () -> Unit,
    onFixPassword: (PasswordEntity) -> Unit = {}
) {
    var weakCount by remember { mutableStateOf(0) }
    var reusedCount by remember { mutableStateOf(0) }
    var strongCount by remember { mutableStateOf(0) }
    val flaggedList = remember { mutableStateListOf<Triple<PasswordEntity, String, String>>() }

    LaunchedEffect(passwords) {
        var weak = 0
        val passFrequency = mutableMapOf<String, Int>()
        val decryptedCache = mutableListOf<Pair<PasswordEntity, String>>()

        passwords.forEach { p ->
            val plain = try { cryptoManager.decryptToString(p.encryptedPassword) } catch (_: Exception) { "" }
            decryptedCache.add(Pair(p, plain))
            if (plain.isNotEmpty()) {
                passFrequency[plain] = (passFrequency[plain] ?: 0) + 1
            }
        }

        flaggedList.clear()
        decryptedCache.forEach { (entity, plain) ->
            var issue: String? = null
            if (plain.length < 8) {
                issue = "Weak (under 8 chars)"
                weak++
            } else if (!plain.any { it.isDigit() } || !plain.any { it.isUpperCase() }) {
                issue = "Moderate (needs digits/caps)"
                weak++
            }

            val freq = passFrequency[plain] ?: 1
            if (freq > 1) {
                issue = if (issue != null) "$issue · Reused" else "Reused password ($freq accounts)"
            }

            if (issue != null) {
                flaggedList.add(Triple(entity, entity.serviceName, issue))
            }
        }

        weakCount = weak
        reusedCount = passFrequency.values.count { it > 1 }
        strongCount = (passwords.size - weak).coerceAtLeast(0)
    }

    val healthScore = remember(passwords.size, weakCount, reusedCount) {
        if (passwords.isEmpty()) 100
        else {
            val score = 100 - (weakCount * 15) - (reusedCount * 20)
            score.coerceIn(10, 100)
        }
    }

    val scoreColor = when {
        healthScore >= 80 -> Color(0xFF10B981)
        healthScore >= 50 -> Color(0xFFF59E0B)
        else -> Color(0xFFEF4444)
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.Security, contentDescription = null, tint = Color(0xFF10B981))
                Text("Security Health Audit", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Score Banner
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = scoreColor.copy(alpha = 0.12f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Vault Health Score", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(
                                if (healthScore >= 80) "Vault is well secured" else "Attention recommended",
                                fontSize = 12.sp,
                                color = scoreColor
                            )
                        }
                        Text(
                            text = "$healthScore%",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = scoreColor
                        )
                    }
                }

                // Stats breakdown
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    ElevatedCard(modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp)) {
                        Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("$strongCount", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF10B981))
                            Text("Strong", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                        }
                    }
                    ElevatedCard(modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp)) {
                        Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("$weakCount", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFFEF4444))
                            Text("Weak", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                        }
                    }
                    ElevatedCard(modifier = Modifier.weight(1f), shape = RoundedCornerShape(12.dp)) {
                        Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("$reusedCount", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFFF59E0B))
                            Text("Reused", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                        }
                    }
                }

                // Flagged entries
                if (flaggedList.isNotEmpty()) {
                    Text("Attention Needed:", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    flaggedList.take(6).forEach { (entity, svc, issue) ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                .padding(8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(svc, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                Text(issue, fontSize = 11.sp, color = Color(0xFFEF4444))
                            }
                            TextButton(onClick = { onFixPassword(entity) }) {
                                Text("Fix / Edit", fontSize = 12.sp)
                            }
                        }
                    }
                } else {
                    Text(
                        "All ${passwords.size} passwords have strong entropy and no reused credentials!",
                        fontSize = 12.sp,
                        color = Color(0xFF10B981)
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Done")
            }
        }
    )
}

// ==========================================
// 3. PASSWORD GENERATOR MODAL (Sparkles)
// ==========================================
@Composable
fun StandalonePasswordGeneratorDialog(
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var length by remember { mutableStateOf(16f) }
    var useUppercase by remember { mutableStateOf(true) }
    var useNumbers by remember { mutableStateOf(true) }
    var useSymbols by remember { mutableStateOf(true) }
    var generatedPassword by remember { mutableStateOf("") }

    fun generate() {
        val lower = "abcdefghijklmnopqrstuvwxyz"
        val upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        val digits = "0123456789"
        val symbols = "!@#$%^&*()-_=+[]{}<>?"

        val pool = StringBuilder(lower)
        if (useUppercase) pool.append(upper)
        if (useNumbers) pool.append(digits)
        if (useSymbols) pool.append(symbols)

        val chars = pool.toString()
        generatedPassword = (1..length.toInt()).map { chars[Random.nextInt(chars.length)] }.joinToString("")
    }

    LaunchedEffect(Unit) {
        generate()
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color(0xFF818CF8))
                Text("Password Generator", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = generatedPassword,
                            fontSize = 17.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = { generate() }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Regenerate")
                        }
                    }
                }

                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Length: ${length.toInt()} characters", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        val strength = when {
                            length >= 16 -> "Very Strong"
                            length >= 12 -> "Strong"
                            else -> "Moderate"
                        }
                        Text(strength, fontSize = 12.sp, color = Color(0xFF10B981), fontWeight = FontWeight.Bold)
                    }
                    Slider(
                        value = length,
                        onValueChange = {
                            length = it
                            generate()
                        },
                        valueRange = 8f..32f,
                        steps = 23
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Uppercase (A-Z)", fontSize = 13.sp)
                    Switch(checked = useUppercase, onCheckedChange = { useUppercase = it; generate() })
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Numbers (0-9)", fontSize = 13.sp)
                    Switch(checked = useNumbers, onCheckedChange = { useNumbers = it; generate() })
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Symbols (!@#$)", fontSize = 13.sp)
                    Switch(checked = useSymbols, onCheckedChange = { useSymbols = it; generate() })
                }

                Button(
                    onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        val clip = ClipData.newPlainText("Generated Password", generatedPassword)
                        clipboard.setPrimaryClip(clip)
                        Toast.makeText(context, "Password copied to clipboard!", Toast.LENGTH_SHORT).show()
                        onDismiss()
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Copy Password")
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}

// ==========================================
// 4. SETTINGS MODAL (Gear)
// ==========================================
@Composable
fun SettingsDialog(
    totalCredentials: Int,
    isDarkTheme: Boolean,
    onToggleTheme: () -> Unit,
    onDismiss: () -> Unit,
    onWipeAll: () -> Unit
) {
    var confirmWipe by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.Settings, contentDescription = null)
                Text("Vault Settings", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Theme Toggle Card
                ElevatedCard(shape = RoundedCornerShape(14.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Theme Appearance", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text(if (isDarkTheme) "Dark Mode active" else "Light Mode active", fontSize = 12.sp, color = MaterialTheme.colorScheme.outline)
                        }
                        IconButton(onClick = onToggleTheme) {
                            Icon(
                                if (isDarkTheme) Icons.Default.LightMode else Icons.Default.DarkMode,
                                contentDescription = "Toggle Theme",
                                tint = if (isDarkTheme) Color(0xFFFBBF24) else Color(0xFF6366F1)
                            )
                        }
                    }
                }

                // Security status
                ElevatedCard(shape = RoundedCornerShape(14.dp)) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Security Architecture", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(16.dp))
                            Text("Hardware KeyStore AES-256 Active", fontSize = 12.sp)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(16.dp))
                            Text("FLAG_SECURE Anti-Screenshot Active", fontSize = 12.sp)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(16.dp))
                            Text("100% Offline (Zero INTERNET permission)", fontSize = 12.sp)
                        }
                    }
                }

                // Vault info
                ElevatedCard(shape = RoundedCornerShape(14.dp)) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Storage Stats", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("$totalCredentials encrypted credentials saved locally", fontSize = 12.sp, color = MaterialTheme.colorScheme.outline)
                        Text("Database: SQLite Room (Hardware Keystore Encrypted)", fontSize = 11.sp, color = MaterialTheme.colorScheme.outline)
                    }
                }

                // Wipe Vault
                if (!confirmWipe) {
                    OutlinedButton(
                        onClick = { confirmWipe = true },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFEF4444)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.DeleteForever, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Erase Entire Local Vault")
                    }
                } else {
                    Button(
                        onClick = onWipeAll,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Confirm Permanent Erase (${totalCredentials} items)")
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}

// ==========================================
// PASSWORD ITEM CARD
// ==========================================
@Composable
fun PasswordItemCard(
    item: PasswordEntity,
    cryptoManager: CryptoManager,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onToggleFavorite: () -> Unit,
    onDelete: () -> Unit
) {
    val context = LocalContext.current

    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Left Icon Badge
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF14213D)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Language,
                        contentDescription = "Open Details",
                        tint = Color(0xFF60A5FA),
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                // App/Website Name & Gmail/Username (Only these displayed by default!)
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.serviceName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = item.username.ifBlank { "No username" },
                        fontSize = 12.sp,
                        color = Color(0xFF93C5FD),
                        fontFamily = FontFamily.Monospace
                    )
                }

                // Right Controls: Star & Sleek Square Copy Button
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(
                        onClick = onToggleFavorite,
                        modifier = Modifier.size(34.dp)
                    ) {
                        Icon(
                            imageVector = if (item.isFavorite) Icons.Default.Star else Icons.Default.StarBorder,
                            contentDescription = "Favorite",
                            tint = if (item.isFavorite) Color(0xFFF59E0B) else MaterialTheme.colorScheme.outline,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // Compact Square Copy Button (Matching Screenshot)
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .clickable {
                                try {
                                    val pwd = cryptoManager.decryptToString(item.encryptedPassword)
                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    val clip = ClipData.newPlainText("password", pwd)
                                    clipboard.setPrimaryClip(clip)
                                    Toast.makeText(context, "Password copied to clipboard", Toast.LENGTH_SHORT).show()
                                } catch (_: Exception) {
                                    Toast.makeText(context, "Failed to copy", Toast.LENGTH_SHORT).show()
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.ContentCopy,
                            contentDescription = "Copy Password",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(17.dp)
                        )
                    }
                }
            }
        }
    }
}

// ==========================================
// ADD PASSWORD DIALOG
// ==========================================
@Composable
fun AddPasswordDialog(
    onDismiss: () -> Unit,
    onSave: (service: String, user: String, pass: String, category: String, url: String) -> Unit
) {
    var serviceName by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("website") }
    var url by remember { mutableStateOf("") }
    var isPasswordVisible by remember { mutableStateOf(false) }

    val categories = listOf("website", "app", "email", "wifi", "financial", "other")

    fun generateRandomPassword(): String {
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
        return (1..16).map { chars[Random.nextInt(chars.length)] }.joinToString("")
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add New Password", fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = serviceName,
                    onValueChange = { serviceName = it },
                    label = { Text("Service / App Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("Username / Email") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        Row {
                            IconButton(onClick = { password = generateRandomPassword() }) {
                                Icon(Icons.Default.AutoAwesome, contentDescription = "Generate", tint = Color(0xFF818CF8))
                            }
                            IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                                Icon(
                                    if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = null
                                )
                            }
                        }
                    }
                )

                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it },
                    label = { Text("Website URL (Optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (serviceName.isNotBlank() && password.isNotBlank()) {
                        onSave(serviceName.trim(), username.trim(), password.trim(), category, url.trim())
                    }
                },
                enabled = serviceName.isNotBlank() && password.isNotBlank()
            ) {
                Text("Save Encrypted")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
