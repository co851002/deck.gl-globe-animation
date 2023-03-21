import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';

import { _GlobeView as GlobeView, COORDINATE_SYSTEM } from '@deck.gl/core';

const RotatingGlobe = () => {
  const [viewState, setViewState] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 1,
    minZoom: 0,
    maxZoom: 20,
    pitch: 0,
    bearing: 0,
  });

  const [rotate, setRotate] = useState(false);

  useEffect(() => {
    let animationInterval;
    if (rotate) {
      animationInterval = setInterval(() => {
        setViewState((prevViewState) => {
          return { ...prevViewState, longitude: prevViewState.longitude + 1 };
        });
      }, 30);
    } else {
      clearInterval(animationInterval);
    }
    return () => clearInterval(animationInterval);
  }, [rotate]);

  const layers = [
    new TileLayer({
      id: 'tile-layer',
      data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,

      renderSubLayers: (props) => {
        const {
          bbox: { west, south, east, north },
        } = props.tile;

        return new BitmapLayer(props, {
          data: null,
          image: props.data,
          _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          bounds: [west, south, east, north],
        });
      },
    }),
  ];

  const onClickHandler = () => {
    setRotate(!rotate);
  };

  return (
    <div>
      <DeckGL
        width="100%"
        height="100%"
        layers={layers}
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        views={new GlobeView()}
        controller={true}
      />
      <button style={{ position: 'absolute', top: 10, right: 10 }} onClick={onClickHandler}>
        {rotate ? 'Stop rotation' : 'Start rotation'}
      </button>
    </div>
  );
};

export default RotatingGlobe;

