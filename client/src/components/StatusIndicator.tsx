// StatusIndicator.tsx - Bouton coloré 🔴/🟢

interface StatusIndicatorProps {
  status: 'generic' | 'optimized' | 'loading';
  size?: 'small' | 'medium';
}

export function StatusIndicator({ status, size = 'small' }: StatusIndicatorProps) {
  const sizeClass = size === 'small' ? 'w-3 h-3' : 'w-4 h-4';
  
  if (status === 'loading') {
    return <div className={`${sizeClass} bg-gray-300 rounded-full animate-pulse`} />;
  }
  
  return (
    <div 
      className={`${sizeClass} rounded-full ${
        status === 'optimized' ? 'bg-green-500' : 'bg-red-500'
      }`}
      title={status === 'optimized' ? 'Livrable optimisé' : 'Livrable générique'}
    />
  );
}