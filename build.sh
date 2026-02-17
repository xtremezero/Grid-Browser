

# build.sh
# Smart build script that auto-detects NixOS/Nix environments

echo "🚀 Starting Electron Grid Browser Build Process..."

# 1. Safety Check: Ensure we are in the project root
if [ ! -f package.json ]; then
    echo "❌ Error: package.json not found. Make sure you are in the project root."
    exit 1
fi

# 2. Check for Nix environment (shell.nix + nix-shell binary)
if [ -f "shell.nix" ] && command -v nix-shell &> /dev/null; then
    echo "❄️  Nix environment detected!"
    echo "🔄 Entering configured Nix shell..."
    
    # We use --run to execute commands INSIDE the environment defined by shell.nix
    # This automatically picks up ELECTRON_OVERRIDE_DIST_PATH and other fixes
    nix-shell shell.nix --run "
        set -e # Stop on error
        
        echo '📦 Installing dependencies (using system Electron)...'
        npm install
        
        echo '⚡ Starting Electron App...'
        npm run dev
    "

else
    # 3. Standard Fallback for non-NixOS systems (Ubuntu, macOS, Windows Git Bash)
    echo "💻 Standard Environment detected."

    if ! command -v node &> /dev/null; then
        echo "❌ Error: Node.js is not installed."
        exit 1
    fi

    echo "📦 Installing dependencies..."
    npm install

    echo "⚡ Starting Development Mode..."
    npm run dev
fi
