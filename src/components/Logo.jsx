import clsx from 'clsx';
import { useOptions } from '/src/utils/optionsContext';
import { memo, useMemo } from 'react';

const Logo = memo(({ options, action, width, height, black = false }) => {
  const { options: op } = useOptions();

  const style = useMemo(() => {
    const lightAdj = !black && op.type === 'light' ? { filter: 'invert(80%)' } : {};
    const dimensions = {
      ...(width && { width }),
      ...(height && { height }),
    };
    return { ...lightAdj, ...dimensions };
  }, [op.type, width, height, black]);

  const className = useMemo(
    () =>
      clsx(
        options,
        action && 'cursor-pointer duration-300 ease-out scale-[1.12] hover:scale-[1.15]',
        'select-none',
      ),
    [options, action],
  );

  return (
    <img
      src={black ? '/logo-black.svg' : '/logo.svg'}
      className={className}
      id="btn-logo"
      draggable="false"
      alt="senninproxy"
      onClick={action}
      style={style}
    />
  );
});

Logo.displayName = 'Logo';
export default Logo;
