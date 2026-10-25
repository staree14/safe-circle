package com.safecircle.app.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = SafeMaroon,
    onPrimary = SafeCardBg,
    primaryContainer = SafeBlush,
    onPrimaryContainer = SafeMaroon,
    secondary = SafeRose,
    onSecondary = SafeCardBg,
    background = SafeBackground,
    onBackground = SafeTextDark,
    surface = SafeCardBg,
    onSurface = SafeTextDark,
    error = EmergencyRed,
    onError = SafeCardBg
)

private val DarkColorScheme = darkColorScheme(
    primary = SafeRose,
    onPrimary = SafeCardBg,
    primaryContainer = DarkCard,
    onPrimaryContainer = DarkTextPrimary,
    secondary = SafeBlush,
    onSecondary = SafeTextDark,
    background = DarkBackground,
    onBackground = DarkTextPrimary,
    surface = DarkSurface,
    onSurface = DarkTextPrimary,
    error = EmergencyRed,
    onError = SafeCardBg
)

@Composable
fun SafeCircleTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
