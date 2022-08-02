import type { JSXNode } from '@builder.io/qwik/jsx-runtime';
import { suite } from 'uvu';
import { equal } from 'uvu/assert';
import { createSimpleDocument } from '../../../server/document';

import type { StreamWriter } from '../../../server/types';
import { component$ } from '../../component/component.public';
import { inlinedQrl } from '../../import/qrl';
import { $ } from '../../import/qrl.public';
import { createContext, useContextProvider } from '../../use/use-context';
import { useOn, useOnDocument, useOnWindow } from '../../use/use-on';
import { Resource, useResource$ } from '../../use/use-resource';
import { Ref, useRef, useStore } from '../../use/use-store.public';
import { useStylesQrl } from '../../use/use-styles';
import { useClientEffect$ } from '../../use/use-watch';
import { delay } from '../../util/promises';
import { Host, SkipRerender, SSRFlush, SSRMark } from '../jsx/host.public';
import { Slot } from '../jsx/slot.public';
import { renderSSR, RenderSSROptions } from './render-ssr';

const renderSSRSuite = suite('renderSSR');
renderSSRSuite('render attributes', async () => {
  await testSSR(
    <html>
      <div id="stuff" aria-required="true" role=""></div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div id="stuff" aria-required="true" role></div></html>'
  );
});

renderSSRSuite('render className', async () => {
  await testSSR(
    <html>
      <div className="stuff"></div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div class="stuff"></div></html>'
  );
});

renderSSRSuite('render class', async () => {
  await testSSR(
    <html>
      <div
        class={{
          stuff: true,
          other: false,
        }}
      ></div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div class="stuff"></div></html>'
  );
});

renderSSRSuite('render contentEditable', async () => {
  await testSSR(
    <html>
      <div contentEditable="true"></div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div contentEditable="true"></div></html>'
  );
});

renderSSRSuite('self closing elements', async () => {
  await testSSR(
    <html>
      <input></input>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><input></html>'
  );
});

renderSSRSuite('single simple children', async () => {
  await testSSR(
    <html>
      <div>hola</div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div>hola</div></html>'
  );
  await testSSR(
    <html>
      <div>{0}</div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div>0</div></html>'
  );
  await testSSR(
    <html>
      <div>{true}</div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div></div></html>'
  );
  await testSSR(
    <html>
      <div>{false}</div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div></div></html>'
  );
  await testSSR(
    <html>
      <div>{null}</div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div></div></html>'
  );
  await testSSR(
    <html>
      <div>{undefined}</div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div></div></html>'
  );
});

renderSSRSuite('events', async () => {
  await testSSR(
    <html>
      <div onClick$={() => console.warn('hol')}>hola</div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div q:id="0" on:click="/runtimeQRL#_">hola</div></html>'
  );
  await testSSR(
    <html>
      <div document:onClick$={() => console.warn('hol')}>hola</div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div q:id="0" on-document:click="/runtimeQRL#_">hola</div></html>'
  );
  await testSSR(
    <html>
      <div window:onClick$={() => console.warn('hol')}>hola</div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div q:id="0" on-window:click="/runtimeQRL#_">hola</div></html>'
  );
  await testSSR(
    <html>
      <input onInput$={() => console.warn('hol')} />
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><input q:id="0" on:input="/runtimeQRL#_"></html>'
  );
});

renderSSRSuite('ref', async () => {
  const ref = { current: undefined } as Ref<any>;
  await testSSR(
    <html>
      <div ref={ref}></div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div q:id="0"></div></html>'
  );
});
renderSSRSuite('innerHTML', async () => {
  await testSSR(
    <html>
      <div dangerouslySetInnerHTML="<p>hola</p>"></div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div><p>hola</p></div></html>'
  );
});

renderSSRSuite('single complex children', async () => {
  await testSSR(
    <html>
      <div>
        <p>hola</p>
      </div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div><p>hola</p></div></html>'
  );
  await testSSR(
    <html>
      <div>
        hola {2}
        <p>hola</p>
      </div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div>hola 2<p>hola</p></div></html>'
  );
});

renderSSRSuite('single multiple children', async () => {
  await testSSR(
    <html>
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
        <li>5</li>
        <li>6</li>
        <li>7</li>
        <li>8</li>
      </ul>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li></ul></html>'
  );
});

renderSSRSuite('using fragment', async () => {
  await testSSR(
    <html>
      <ul>
        <>
          <li>1</li>
          <li>2</li>
        </>
        <li>3</li>
        <>
          <li>4</li>
          <>
            <li>5</li>
            <>
              <>
                <li>6</li>
              </>
            </>
          </>
          <li>7</li>
        </>
        <li>8</li>
      </ul>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li><li>8</li></ul></html>'
  );
});

renderSSRSuite('using promises', async () => {
  await testSSR(
    <html>
      <div>{Promise.resolve('hola')}</div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div>hola</div></html>'
  );
  await testSSR(
    <html>
      <div>{Promise.resolve(<p>hola</p>)}</div>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div><p>hola</p></div></html>'
  );

  await testSSR(
    <html>
      <ul>
        {Promise.resolve(<li>1</li>)}
        <li>2</li>
        {delay(100).then(() => (
          <li>3</li>
        ))}
        {delay(10).then(() => (
          <li>4</li>
        ))}
      </ul>
    </html>,
    [
      '<html',
      ' q:container="paused"',
      ' q:version="dev"',
      ' q:render="ssr"',
      '>',
      '<ul',
      '>',
      '<li',
      '>',
      '1',
      '</li>',
      '<li',
      '>',
      '2',
      '</li>',
      '<li',
      '>',
      '3',
      '</li>',
      '<li',
      '>',
      '4',
      '</li>',
      '</ul>',
      '</html>',
    ]
  );
});

renderSSRSuite('DelayResource', async () => {
  await testSSR(
    <html>
      <ul>
        <DelayResource text="thing" delay={100} />
        <DelayResource text="thing" delay={10} />
      </ul>
    </html>,
    `<html q:container="paused" q:version="dev" q:render="ssr">
    <ul>
      <div q:key="sX:" class="cmp" q:id="1">
        <style q:style="fio5tb-0">.cmp {background: blue}</style>
        <span>thing</span>
      </div>
      <div q:key="sX:" class="cmp" q:id="0">
        <span>thing</span>
      </div>
    </ul>
  </html>`
  );
});

renderSSRSuite('using promises with DelayResource', async () => {
  await testSSR(
    <html>
      <ul>
        {delay(10).then(() => (
          <li>thing</li>
        ))}
        <DelayResource text="thing" delay={500} />
      </ul>
    </html>,
    `<html q:container="paused" q:version="dev" q:render="ssr">
      <ul>
        <li>thing</li>
        <div q:key="sX:" class="cmp" q:id="0">
          <style q:style="fio5tb-0">.cmp {background: blue}</style>
          <span>thing</span>
        </div>
      </ul>
    </html>`
  );
});

renderSSRSuite('using component', async () => {
  await testSSR(
    <html>
      <MyCmp />
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><section q:key="sX:" class="my-cmp" q:id="0"><div>MyCmp{}</div></section></html>'
  );
});

renderSSRSuite('using component with key', async () => {
  await testSSR(
    <html>
      <MyCmp key="hola" />
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><section q:key="sX:hola" class="my-cmp" q:id="0"><div>MyCmp{}</div></section></html>'
  );
});

renderSSRSuite('using component props', async () => {
  await testSSR(
    <html>
      <MyCmp id="12" host:prop="attribute" prop="12" />
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><section id="12" prop="attribute" q:key="sX:" class="my-cmp" q:id="0"><div>MyCmp{"prop":"12"}</div></section></html>'
  );
});

renderSSRSuite('using component project content', async () => {
  await testSSR(
    <html>
      <MyCmp>
        <div>slot</div>
      </MyCmp>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><section q:key="sX:" class="my-cmp" q:id="0"><div>MyCmp{}</div><q:template q:slot hidden aria-hidden="true"><div>slot</div></q:template></section></html>'
  );
});

renderSSRSuite('using complex component', async () => {
  await testSSR(
    <html>
      <MyCmpComplex></MyCmpComplex>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div q:key="sX:" q:id="0" on:click="/runtimeQRL#_"><div q:id="1"><button q:id="2" on:click="/runtimeQRL#_">Click</button><q:slot q:sname q:key q:sref="0"></q:slot></div></div></html>'
  );
});

renderSSRSuite('using complex component with slot', async () => {
  await testSSR(
    <html>
      <MyCmpComplex>Hola</MyCmpComplex>
    </html>,
    '<html q:container="paused" q:version="dev" q:render="ssr"><div q:key="sX:" q:id="0" on:click="/runtimeQRL#_"><div q:id="1"><button q:id="2" on:click="/runtimeQRL#_">Click</button><q:slot q:sname q:key q:sref="0">Hola</q:slot></div></div></html>'
  );
});

renderSSRSuite('<head>', async () => {
  await testSSR(
    <html>
      <head>
        <title>hola</title>
        <>
          <meta></meta>
          <div>
            <p>hola</p>
          </div>
        </>
      </head>
    </html>,
    `
  <html q:container="paused" q:version="dev" q:render="ssr">
    <head>
      <title q:head>hola</title>
      <meta q:head>
      <div q:head>
        <p>hola</p>
      </div>
      <style id="qwik/base-styles">
        q\\:slot{display:contents}
        q\\:fallback,q\\:template{display:none}
        q\\:fallback:last-child{display:contents}
      </style>
    </head>
  </html>`
  );
});

renderSSRSuite('named slots', async () => {
  await testSSR(
    <html>
      <NamedSlot>
        Text
        <div q:slot="start">START: 1</div>
        <>
          <div q:slot="end">END: 1</div>
          from
          <div q:slot="start">START: 2</div>
        </>
        <div q:slot="end">END: 2</div>
        default
      </NamedSlot>
    </html>,
    `
    <html q:container="paused" q:version="dev" q:render="ssr">
      <div q:key="sX:" q:id="0">
        <q:slot q:sname="start" q:key="start" q:sref="0">
          <div q:slot="start">START: 1</div><div q:slot="start">START: 2</div>
        </q:slot>
        <div>
          <q:slot q:sname q:key q:sref="0">
            Textfromdefault
          </q:slot>
        </div>
        <q:slot q:sname="end" q:key="end" q:sref="0">
          <div q:slot="end">END: 1</div><div q:slot="end">END: 2</div>
        </q:slot>
      </div>
    </html>`
  );
});

renderSSRSuite('nested slots', async () => {
  await testSSR(
    <html>
      <SimpleSlot name="root">
        <SimpleSlot name="level 1">
          <SimpleSlot name="level 2">
            BEFORE CONTENT
            <div>Content</div>
            AFTER CONTENT
          </SimpleSlot>
        </SimpleSlot>
      </SimpleSlot>
    </html>,
    `
<html q:container="paused" q:version="dev" q:render="ssr">
  <div q:key="sX:" id="root" q:id="0">
    Before root
    <q:slot q:sname q:key q:sref="0">
      <div q:key="sX:" id="level 1" q:id="1">
        Before level 1
        <q:slot q:sname q:key q:sref="1">
          <div q:key="sX:" id="level 2" q:id="2">
            Before level 2
            <q:slot q:sname q:key q:sref="2">
              BEFORE CONTENT
              <div>Content</div>
              AFTER CONTENT
            </q:slot>
            After level 2
          </div>
        </q:slot>
        After level 1
      </div>
    </q:slot>
    After root
  </div>
  </html>`
  );
});

renderSSRSuite('component useContextProvider()', async () => {
  await testSSR(
    <html>
      <Context />
    </html>,
    `<html q:container="paused" q:version="dev" q:render="ssr"><div q:key="sX:" q:id="0" q:ctx="internal qwikcity"></div></html>`
  );
});

renderSSRSuite('component useOn()', async () => {
  await testSSR(
    <html>
      <Events />
    </html>,
    `<html q:container="paused" q:version="dev" q:render="ssr"><div q:key="sX:" q:id="0" on:click="/runtimeQRL#_\n/runtimeQRL#_" on-window:click="/runtimeQRL#_" on-document:click="/runtimeQRL#_"></div></html>`
  );
});

renderSSRSuite('component useStyles()', async () => {
  await testSSR(
    <html>
      <Styles />
    </html>,
    `<html q:container="paused" q:version="dev" q:render="ssr">
      <div q:key="sX:" class="host" q:id="0">
        <style q:style="17nc-0">.host {color: red}</style>
        Text
      </div>
    </html>`
  );
});

renderSSRSuite('component useClientEffect()', async () => {
  await testSSR(
    <html>
      <UseClientEffect />
    </html>,
    `<html q:container="paused" q:version="dev" q:render="ssr"><div q:key="sX:" q:id="0" on:qvisible="/runtimeQRL#_[0]"></div></html>`
  );
});

renderSSRSuite('nested html', async () => {
  await testSSR(
    <>
      <html>
        <div></div>
      </html>
    </>,
    `<html q:container="paused" q:version="dev" q:render="ssr"><div></div></html>`
  );
});

renderSSRSuite('root html component', async () => {
  await testSSR(
    <HtmlCmp host:aria-hidden="true" />,
    `<html aria-hidden="true" q:container="paused" q:version="dev" q:render="ssr" prop="123" q:id="0" on:qvisible="/runtimeQRL#_[0]"><div>hola</div></html>`
  );
});

renderSSRSuite('fragment name', async () => {
  await testSSR(
    <>
      <Styles />
      <UseClientEffect></UseClientEffect>
    </>,
    `<container q:container="paused" q:version="dev" q:render="ssr" q:base="/manu/folder"><style id="qwik/base-styles">q\\:slot{display:contents}q\\:fallback,q\\:template{display:none}q\\:fallback:last-child{display:contents}</style><div q:key="sX:" class="host" q:id="1"><style q:style="17nc-0">.host {color: red}</style>Text</div><div q:key="sX:" q:id="0" on:qvisible="/runtimeQRL#_[0]"></div></container>`,
    {
      fragmentTagName: 'container',
      base: '/manu/folder',
    }
  );
});

renderSSRSuite('ssr marks', async () => {
  await testSSR(
    <html>
      {delay(100).then(() => (
        <li>1</li>
      ))}
      <SSRFlush />
      {delay(10).then(() => (
        <li>2</li>
      ))}
      <SSRMark message="here" />
      <div>
        <SSRMark message="i am" />
      </div>
      {delay(120).then(() => (
        <li>3</li>
      ))}
    </html>,
    `<html q:container="paused" q:version="dev" q:render="ssr">
      <li>1</li>
      <!--qkssr-f-->
      <li>2</li>
      <!--here-->
      <div>
        <!--i am-->
      </div>
      <li>3</li>
    </html>`
  );
});

renderSSRSuite('html slot', async () => {
  await testSSR(
    <HtmlContext>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik</title>
      </head>
      <body>
        <div></div>
      </body>
    </HtmlContext>,
    `<html q:container="paused" q:version="dev" q:render="ssr" q:base="/manu/folder" q:sname q:id="0" q:ctx="internal" q:sref="0">
      <head>
        <meta charSet="utf-8" q:head>
        <title q:head>Qwik</title>
        <style id="qwik/base-styles">q\\:slot{display:contents}q\\:fallback,q\\:template{display:none}q\\:fallback:last-child{display:contents}</style>
      </head>
      <body>
        <div></div>
      </body>
    </html>`,
    {
      base: '/manu/folder',
    }
  );
});

renderSSRSuite('null component', async () => {
  await testSSR(
    <html>
      <NullCmp />
    </html>,
    `<html q:container="paused" q:version="dev" q:render="ssr"><div q:key="sX:" q:id="0"></div></html>`
  );
});
// TODO
// Merge props on host
// - host events
// - class
// - style
// Container with tagName
// End-to-end with qwikcity
// SVG rendering
// Performance metrics

renderSSRSuite.run();

export const MyCmp = component$(
  (props: Record<string, any>) => {
    return (
      <Host class="my-cmp">
        <div>
          MyCmp
          {JSON.stringify(props)}
        </div>
      </Host>
    );
  },
  {
    tagName: 'section',
  }
);

export const MyCmpComplex = component$((props: Record<string, any>) => {
  const ref = useRef();
  return (
    <Host onClick$={() => console.warn('from component')}>
      <div ref={ref}>
        <button onClick$={() => console.warn('click')}>Click</button>
        <Slot></Slot>
      </div>
    </Host>
  );
});

export const SimpleSlot = component$((props: { name: string }) => {
  return (
    <Host id={props.name}>
      Before {props.name}
      <Slot></Slot>
      After {props.name}
    </Host>
  );
});

export const NamedSlot = component$(() => {
  return (
    <Host>
      <Slot name="start" />
      <div>
        <Slot></Slot>
      </div>
      <Slot name="end" />
    </Host>
  );
});

export const Events = component$(() => {
  useOn(
    'click',
    $(() => console.warn('click'))
  );
  useOnWindow(
    'click',
    $(() => console.warn('window:click'))
  );
  useOnDocument(
    'click',
    $(() => console.warn('document:click'))
  );

  return <Host onClick$={() => console.warn('scroll')}></Host>;
});

export const Styles = component$(() => {
  useStylesQrl(inlinedQrl('.host {color: red}', 'styles_987'));

  return <Host class="host">Text</Host>;
});

const CTX_INTERNAL = createContext<{}>('internal');
const CTX_QWIK_CITY = createContext<{}>('qwikcity');

export const Context = component$(() => {
  useContextProvider(CTX_INTERNAL, {});
  useContextProvider(CTX_QWIK_CITY, {});
  return <Host></Host>;
});

export const UseClientEffect = component$(() => {
  useClientEffect$(() => {
    console.warn('client effect');
  });
  return <Host></Host>;
});

export const HtmlCmp = component$(
  () => {
    useClientEffect$(() => {
      console.warn('client effect');
    });
    return (
      <Host prop="123">
        <div>hola</div>
      </Host>
    );
  },
  {
    tagName: 'html',
  }
);

export const HtmlContext = component$(
  () => {
    const store = useStore({});
    useContextProvider(CTX_INTERNAL, store);

    return (
      <Host q:sname="">
        <SkipRerender />
      </Host>
    );
  },
  {
    tagName: 'html',
  }
);
async function testSSR(
  node: JSXNode,
  expected: string | string[],
  opts?: Partial<RenderSSROptions>
) {
  const doc = createSimpleDocument() as Document;
  const chunks: string[] = [];
  const stream: StreamWriter = {
    write(chunk) {
      chunks.push(chunk);
    },
  };
  await renderSSR(doc, node, {
    stream,
    ...opts,
  });
  if (typeof expected === 'string') {
    equal(chunks.join(''), expected.replace(/(\n|^)\s+/gm, ''));
  } else {
    equal(chunks, expected);
  }
}

export const DelayResource = component$((props: { text: string; delay: number }) => {
  useStylesQrl(inlinedQrl(`.cmp {background: blue}`, 'styles_DelayResource'));

  const resource = useResource$<string>(async ({ track }) => {
    track(props, 'text');
    await delay(props.delay);
    return props.text;
  });
  return (
    <Host class="cmp">
      <Resource resource={resource} onResolved={(value) => <span>{value}</span>} />
    </Host>
  );
});

export const NullCmp = component$(() => {
  return null;
});