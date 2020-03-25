import React, { useState } from 'react';
import SeeThrough from '../src/SeeThrough/SeeThrough';

export default function Example() {
  const [active, setActive] = useState(false);

  return (
    <div>
      <button onClick={ () => setActive(!active) }>Toggle</button>

      <SeeThrough active={ active }>
        <div>Some text</div>
      </SeeThrough>
    </div>
  );
}
