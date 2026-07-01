export default function LoadingSpinner({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const wrappers = { sm: '', md: 'p-4', lg: 'min-h-64 flex items-center justify-center' };

  return (
    <div className={wrappers[size]}>
      <div className={`${sizes[size]} animate-spin rounded-full border-4 border-green-100 border-t-green-600 mx-auto`} />
    </div>
  );
}
