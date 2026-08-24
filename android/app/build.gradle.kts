plugins { id("com.android.application") }

val signingStore = System.getenv("PINMIND_KEYSTORE_PATH")

android {
    namespace = "com.pinmind.beta"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.pinmind.beta"
        minSdk = 24
        targetSdk = 35
        versionCode = 51
        versionName = "0.7.8"
    }
    signingConfigs {
        create("release") {
            if (!signingStore.isNullOrBlank()) {
                storeFile = file(signingStore)
                storePassword = System.getenv("PINMIND_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("PINMIND_KEY_ALIAS")
                keyPassword = System.getenv("PINMIND_KEY_PASSWORD")
            }
        }
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
        }
    }
}