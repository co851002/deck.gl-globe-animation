import './App.css';
import React from 'react';
// import DeckGL from '@deck.gl/react';
// import { BitmapLayer } from '@deck.gl/layers';
// import { _GlobeView, COORDINATE_SYSTEM } from '@deck.gl/core';
// import { TileLayer } from '@deck.gl/geo-layers';
// import { AnimationLoop, Model, Geometry } from '@luma.gl/core';
import RotatingGlobe from './components/RotatingGlobe3'

// const views = new _GlobeView({
//   resolution: 10
// });

// const initialViewState = {
//   longitude: 2.27,
//   latitude: 30.86,
//   zoom: 0,
//   minZoom: 0,
//   maxZoom: 20
// };

// const controller = {
//   controller: true,
// }

// const layers = [
//   new TileLayer({
//     data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
//     minZoom: 0,
//     maxZoom: 19,
//     tileSize: 256,

//     renderSubLayers: props => {
//       const {
//         bbox: { west, south, east, north }
//       } = props.tile;

//       return new BitmapLayer(props, {
//         data: null,
//         image: props.data,
//         _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
//         bounds: [west, south, east, north]
//       });
//     }
//   })
// ]

// const viewState = {
//   latitude: 0,
//   longitude: 0,
//   zoom: 0,
//   minZoom: 0,
//   maxZoom: 20,
//   pitch: 0,
//   bearing: 0,
// };

function App() {
  // const [rotation, setRotation] = useState([0, 0, 0]);
  // const animationLoopRef = useRef(null);

  // const onClickHandler = useCallback(() => {
  //   if (animationLoopRef.current) {
  //     animationLoopRef.current.stop();
  //     animationLoopRef.current = null;
  //   } else {
  //     const animationLoop = new AnimationLoop({
  //       onInitialize: ({ gl }) => {
  //         return {
  //           model: new Model(gl, {
  //             geometry: new Geometry({
  //               drawMode: 'TRIANGLES',
  //               vertexCount: 0,
  //             }),
  //           }),
  //         };
  //       },
  //       onRender: () => {
  //         setRotation((prevRotation) => [
  //           prevRotation[0] + 1,
  //           prevRotation[1] + 1,
  //           prevRotation[2] + 1,
  //         ]);
  //       },
  //     });

  //     animationLoopRef.current = animationLoop;
  //     animationLoop.start();
  //   }
  // }, []);



  return (
    <>
    <RotatingGlobe></RotatingGlobe>
      {/* <DeckGL
        initialViewState={initialViewState}
        controller={controller}
        layers={layers}
        views={views}
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
      />
      <button style={{ position: 'absolute', top: 10, right: 10 }} onClick={onClickHandler}>
        {animationLoopRef.current ? 'Stop rotation' : 'Start rotation'}
      </button> */}
    </>

  );
}

export default App;
