/**
 * useImageViewer composable
 * Manages the state of the global image lightbox.
 */
export function useImageViewer() {
  const isOpen = useState('image-viewer-open', () => false)
  const currentImageUrl = useState<string | null>('image-viewer-url', () => null)

  function openImage(url: string) {
    currentImageUrl.value = url
    isOpen.value = true
  }

  function closeImage() {
    isOpen.value = false
    setTimeout(() => {
      currentImageUrl.value = null
    }, 300) // Clear after animation
  }

  return {
    isOpen,
    currentImageUrl,
    openImage,
    closeImage
  }
}
