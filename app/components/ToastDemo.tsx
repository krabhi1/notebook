import { useSonner } from "~/hooks/useSonner";

export function ToastDemo() {
  const toast = useSonner();

  const showSuccessToast = () => {
    toast.success("File saved successfully", {
      description: "All changes synchronized",
      duration: 2000,
    });
  };

  const showErrorToast = () => {
    toast.error("Failed to save file", {
      description: "Network connection lost",
      duration: 5000,
      action: {
        label: "Retry",
        onClick: () => toast.info("Retrying save..."),
      },
    });
  };

  const showWarningToast = () => {
    toast.warning("Offline mode", {
      description:
        "Changes will be saved locally and synced when you reconnect",
      duration: Infinity,
      icon: "📱",
    });
  };

  const showInfoToast = () => {
    toast.info("Back online", {
      description: "Syncing 3 file(s) with unsaved changes...",
      duration: 4000,
      icon: "🌐",
    });
  };

  const showLoadingToast = () => {
    toast.loading("Saving changes...", {
      description: "Your changes are being synchronized",
    });
  };

  const showConflictToast = () => {
    toast.error("Conflict in main.tsx", {
      description: "File was modified by another user. Refreshing content...",
      duration: 8000,
      action: {
        label: "Dismiss",
        onClick: () => toast.dismiss(),
      },
    });
  };

  const showPromiseToast = () => {
    const savePromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve("Saved!") : reject("Failed to save");
      }, 2000);
    });

    toast.promise(savePromise, {
      loading: "Saving file...",
      success: "File saved successfully!",
      error: "Failed to save file",
    });
  };

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-lg font-semibold mb-4">Toast Demo</h2>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={showSuccessToast}
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Success Toast
        </button>
        <button
          onClick={showErrorToast}
          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Error Toast
        </button>
        <button
          onClick={showWarningToast}
          className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Warning Toast
        </button>
        <button
          onClick={showInfoToast}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Info Toast
        </button>
        <button
          onClick={showLoadingToast}
          className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Loading Toast
        </button>
        <button
          onClick={showConflictToast}
          className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Conflict Toast
        </button>
        <button
          onClick={showPromiseToast}
          className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 col-span-2"
        >
          Promise Toast (Random Success/Fail)
        </button>
      </div>
    </div>
  );
}
