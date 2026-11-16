import Search from '../SearchContainer';
import QuickLinks from '../QuickLinks';
import Logo from '../Logo';

import { process } from '/src/utils/hooks/loader/utils';

const NewTab = ({ id, updateFn, options = {} }) => {
  const navigating = {
    id: id,
    go: updateFn,
    process: (input) => process(input, false, options.prType || 'auto', options.engine || undefined),
  };
  return (
    <div className="h-full w-full bg-white text-[#202124] flex flex-col items-center justify-center p-6 gap-8 overflow-auto">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <Logo black options="w-[15.8rem] h-30 mb-2" />
        <Search nav={false} logo={false} light cls="w-full flex flex-col items-center" navigating={navigating} />
        <QuickLinks cls="mt-16" nav={false} navigating={navigating} />
      </div>
    </div>
  );
};

export default NewTab;
