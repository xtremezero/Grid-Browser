{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  # Dependencies available in the shell
  buildInputs = [
    pkgs.nodejs_20
    pkgs.electron  # This uses the NixOS-patched version of Electron
  ];

  shellHook = ''
    echo "❄️  Welcome to the NixOS Electron Environment"
    
    # 1. Tell npm not to download the broken binary
    export ELECTRON_SKIP_BINARY_DOWNLOAD=1

    # 2. Tell the node_modules to use the system electron we just installed
    # The path usually points to the folder containing the executable
    export ELECTRON_OVERRIDE_DIST_PATH="${pkgs.electron}/bin"
    
    # 3. Add node_modules to path for easy access
    export PATH="$PWD/node_modules/.bin:$PATH"
  '';
}
