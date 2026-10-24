package com.example.safe_circle.presentation

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.CountDownTimer
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.telephony.SmsManager
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.core.app.ActivityCompat
import com.example.safe_circle.R
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource

class EmergencyHoldActivity : ComponentActivity() {

    // TARGET CONTACT: Replace with your actual emergency contact number with country code
    private val targetEmergencyNumber = "+917760765433"
    private val requiredHoldTimeMs = 5000L
    private val permissionRequestCode = 101

    private var isKeyPressed = false
    private var isEmergencyTriggered = false
    private var countDownTimer: CountDownTimer? = null

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var tvStatus: TextView

    private val vibrator: Vibrator by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Ensure screen stays awake and displays over lock screen
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        setShowWhenLocked(true)
        setTurnScreenOn(true)

        setContentView(R.layout.activity_emergency_hold)
        tvStatus = findViewById(R.id.tvStatus)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        // GUARANTEED DEMO FALLBACK: Touch and hold the screen directly
        val rootView = findViewById<View>(android.R.id.content)
        rootView.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    if (!isKeyPressed) {
                        startCountdown()
                    }
                    true
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    if (isKeyPressed) {
                        cancelCountdown()
                    }
                    true
                }
                else -> false
            }
        }

        checkPermissions()
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (isTargetKey(keyCode)) {
            if (!isKeyPressed && event?.repeatCount == 0) {
                startCountdown()
            }
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
        if (isTargetKey(keyCode)) {
            if (isKeyPressed) {
                cancelCountdown()
            }
            return true
        }
        return super.onKeyUp(keyCode, event)
    }

    override fun onPause() {
        super.onPause()
        if (isKeyPressed) {
            cancelCountdown()
        }
    }

    private fun isTargetKey(keyCode: Int): Boolean {
        return keyCode == KeyEvent.KEYCODE_STEM_PRIMARY ||
                keyCode == KeyEvent.KEYCODE_BACK ||
                keyCode == KeyEvent.KEYCODE_STEM_1 ||
                keyCode == KeyEvent.KEYCODE_STEM_2 ||
                keyCode == KeyEvent.KEYCODE_STEM_3
    }

    private fun startCountdown() {
        isKeyPressed = true
        isEmergencyTriggered = false
        pulseVibration(true)

        countDownTimer?.cancel()
        countDownTimer = object : CountDownTimer(requiredHoldTimeMs, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                val secondsRemaining = (millisUntilFinished / 1000L) + 1
                tvStatus.text = "HOLDING...\n${secondsRemaining}s"
            }

            override fun onFinish() {
                isKeyPressed = false
                isEmergencyTriggered = true
                pulseVibration(false)
                tvStatus.text = "SENDING SOS..."
                executeEmergencyProtocol()
            }
        }.start()
    }

    private fun cancelCountdown() {
        isKeyPressed = false
        countDownTimer?.cancel()
        countDownTimer = null
        pulseVibration(false)
        if (!isEmergencyTriggered) {
            tvStatus.text = "HOLD BUTTON\nOR SCREEN (5s)"
        }
    }

    private fun executeEmergencyProtocol() {
        pulseSuccessVibration()
        fetchLocationAndSendSMS()
        makeEmergencyCall()
    }

    private fun fetchLocationAndSendSMS() {
        val hasFineLocation = ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val hasCoarseLocation = ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

        if (!hasFineLocation && !hasCoarseLocation) {
            sendSMS("EMERGENCY! I need immediate help! (Location permission missing on watch)")
            return
        }

        try {
            val cancellationTokenSource = CancellationTokenSource()
            fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, cancellationTokenSource.token)
                .addOnSuccessListener { location: Location? ->
                    if (location != null) {
                        val message = "EMERGENCY! I need help. My live location: https://maps.google.com/?q=${location.latitude},${location.longitude}"
                        sendSMS(message)
                    } else {
                        // Fallback to last known location if getCurrentLocation returns null
                        fusedLocationClient.lastLocation.addOnSuccessListener { lastLoc: Location? ->
                            if (lastLoc != null) {
                                val message = "EMERGENCY! I need help. My last known location: https://maps.google.com/?q=${lastLoc.latitude},${lastLoc.longitude}"
                                sendSMS(message)
                            } else {
                                sendSMS("EMERGENCY! I need immediate help. (Unable to get GPS fix)")
                            }
                        }.addOnFailureListener {
                            sendSMS("EMERGENCY! I need immediate help. (GPS unavailable)")
                        }
                    }
                }
                .addOnFailureListener {
                    sendSMS("EMERGENCY! I need immediate help. (Location request failed)")
                }
        } catch (e: SecurityException) {
            e.printStackTrace()
            sendSMS("EMERGENCY! I need immediate help.")
        }
    }

    private fun sendSMS(message: String) {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "SMS permission not granted", Toast.LENGTH_SHORT).show()
            return
        }

        try {
            val smsManager: SmsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                getSystemService(SmsManager::class.java)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getDefault()
            }
            smsManager.sendTextMessage(targetEmergencyNumber, null, message, null, null)
            Toast.makeText(this, "SMS Sent", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Failed to send SMS: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun makeEmergencyCall() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Call permission not granted", Toast.LENGTH_SHORT).show()
            return
        }

        try {
            val callIntent = Intent(Intent.ACTION_CALL).apply {
                data = Uri.parse("tel:$targetEmergencyNumber")
            }
            startActivity(callIntent)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Call failed: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun pulseVibration(start: Boolean) {
        if (start) {
            val timings = longArrayOf(0, 150, 150, 150)
            vibrator.vibrate(VibrationEffect.createWaveform(timings, 0))
        } else {
            vibrator.cancel()
        }
    }

    private fun pulseSuccessVibration() {
        vibrator.cancel()
        vibrator.vibrate(VibrationEffect.createOneShot(1000, VibrationEffect.DEFAULT_AMPLITUDE))
    }

    private fun checkPermissions() {
        val permissions = arrayOf(
            Manifest.permission.CALL_PHONE,
            Manifest.permission.SEND_SMS,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        val missing = permissions.filter {
            ActivityCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missing.toTypedArray(), permissionRequestCode)
        }
    }
}