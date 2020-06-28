import React, { useState, useCallback, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import CanvasPartialMask from './CanvasPartialMask';
import NoopClassWrapper from './NoopClassWrapper';

const NotifyContext = createContext();

/**
 * @returns a function that notifies the SeeThroughController of an update. The function also passes
 *          an ID unique to the notifier.
 */
export function useNotify() {
  const [notifierID] = useState(useNotify.nextID++);
  const notify = useContext(NotifyContext);
  if(!notify) {
    return null; // There's no SeeThroughController above us
  }

  return (...args) => notify(notifierID, ...args);
}
useNotify.nextID = 1;

export default function SeeThroughController({ children, maskColor }) {
  // seeThroughs is an object that maps (notifier ID -> { active, bounds, onClick })
  const [seeThroughs, setSeeThroughs] = useState({});

  // Each <SeeThrough> will use this notify callback to update the controller of its status
  const notify = useCallback((id, active, bounds, onClick) => setSeeThroughs(seeThroughs => Object.assign(
    {},
    seeThroughs,
    { [id]: { active, bounds, onClick } },
  )), [setSeeThroughs]);

  // Use the active/bounds from all of the SeeThrough instances to compute a joined active/bounds/onClick
  const active = Object.values(seeThroughs).some(seeThrough => seeThrough.active);
  const bounds = [].concat(...Object.values(seeThroughs).map(seeThrough => seeThrough.bounds));
  const onClick = useCallback(mask => {
    Object.values(seeThroughs).forEach(seeThrough => seeThrough.onClick(mask));
  }, [seeThroughs]);

  return (
    <NotifyContext.Provider value={ notify }>
      { children }

      { active && (
        <NoopClassWrapper
          component={ CanvasPartialMask }
          exclude={ bounds }
          onClick={ onClick }
          maskColor={ maskColor }
        />
      ) }
    </NotifyContext.Provider>
  );
}

SeeThroughController.propTypes = {
  /**
   * Anything. All <SeeThrough> elements under this will be tied to this controller and be able to
   * be active at the same time.
   */
  children: PropTypes.any,

  /**
   * The color of the mask around all nested <SeeThrough>s.
   * Supports all canvas fillStyle formats, e.g. "#AAA333", "red", "rgba(10, 12, 8, 0.2)", ...
   */
  maskColor: PropTypes.string,
};

SeeThroughController.defaultProps = {
  maskColor: 'rgba(0, 0, 0, 0.4)',
};
