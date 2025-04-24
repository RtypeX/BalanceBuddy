# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{pkgs}: {
  # Which nixpkgs channel to use.
  channel = "stable-24.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
  ];
  # Sets environment variables in the workspace
  env = {
    NEXT_PUBLIC_FIREBASE_API_KEY = "AIzaSyBnG-UJCxyhRZzuV8dX81F3LLjjBtufUa8";
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "fitnext-dbgrl.firebaseapp.com";
    NEXT_PUBLIC_FIREBASE_PROJECT_ID = "fitnext-dbgrl";
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "fitnext-dbgrl.firebasestorage.app";
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "711440423581";
    NEXT_PUBLIC_FIREBASE_APP_ID = "1:711440423581:web:c83605a0be13e0a3525274";
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = "G-L830SPS6R3";
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];
    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
