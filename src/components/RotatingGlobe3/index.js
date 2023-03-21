import React, { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import {
  _GlobeView as GlobeView,
  COORDINATE_SYSTEM,
  _GlobeController as GlobeController,
} from "@deck.gl/core";
import { Flex, Affix, Button, Select, rem } from "@mantine/core";

const initCoords = {
  lat: 48.86,
  lon: 2.27,
};

const RotatingGlobe = () => {
  const [viewState, setViewState] = useState({
    latitude: initCoords.lat,
    longitude: initCoords.lon,
    zoom: isMobile ? 0.1 : 0.5,
    minZoom: 0,
    maxZoom: 20,
    pitch: 0,
    bearing: 10,
  });

  const startLongitude = viewState.longitude;
  const rotations = 5;
  const extraRotation = 360 * rotations;

  const [rotate, setRotate] = useState(false);

  // Long from select
  const [selectedLongitude, setSelectedLongitude] = useState(initCoords.lon);

  const [targetLongitude, setTargetLongitude] = useState(null);

  // to force a state update- probably a better way to avoid roate returining true when t >= 1
  const [spinCounter, setSpinCounter] = useState(0);

  const selectConfig = [
    { value: "0.127", label: "London" },
    { value: "84.124", label: "Kathmandu" },
    { value: "-74.00", label: "New York" },
    { value: "106.90", label: "Ulaanbaatar" },
  ];

  class CustomController extends GlobeController {
    constructor({selectedLongitude, ...rest}) {
      super(rest);
      this.selectedLongitude = selectedLongitude;
    }
    handleEvent(event) {
      console.log(event);
      console.log(event.direction);

      // if (event.type === 'panend') {
      //   // do something
      //   //event direction - right: 2, left: 4
      //   // if direction is 1 || 2 use the rotate animation otherwise regular pan
      //   console.log('event');
      // } else {
      //   super.handleEvent(event);
      // }

      // if (event.type === 'panend' && (event.direction === 1 || event.direction === 2)) {
      //   const targetLongitude = selectedLongitude;
      //   setTargetLongitude(targetLongitude);
      //   setRotate(true);
      //   setSpinCounter((prevCounter) => prevCounter + 1);
      // } else {
      //   super.handleEvent(event);
      // }

      if (
        event.type === "panend" &&
        (event.direction === 1 || event.direction === 2)
      ) {
        // const bearingChange = event.deltaX ; // Adjust divisor to control sensitivity
        const targetLongitude = parseFloat(selectedLongitude) 
        console.log('rotate here:', targetLongitude )
        const targetLonDiff =
        parseFloat(targetLongitude) - (startLongitude % 360);
      const finalTargetLongitude =
        startLongitude + targetLonDiff + extraRotation;
        console.log('rotate here:', finalTargetLongitude )

        setTargetLongitude(finalTargetLongitude);
        setRotate(true);
        setSpinCounter((prevCounter) => prevCounter + 1);
      } else {
        super.handleEvent(event);
      }
    }
  }

  useEffect(() => {
    let animationInterval;
    let startTime;
    let startLongitude;

    const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    if (rotate) {
      startTime = Date.now();
      startLongitude = viewState.longitude;
      const rotations = 5;
      const extraRotation = 360 * rotations;
      const targetLonDiff =
        parseFloat(targetLongitude) - (startLongitude % 360);
      const finalTargetLongitude =
        startLongitude + targetLonDiff + extraRotation;

      animationInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const t = elapsedTime / 2000;
        const easedT = easeInOutQuad(t);
        const newLongitude =
          startLongitude + (finalTargetLongitude - startLongitude) * easedT;

        setViewState((prevViewState) => {
          return {
            ...prevViewState,
            longitude: newLongitude,
            // latitude: initCoords.lat, // To have the lat fixed to initCoords
          };
        });

        if (t >= 1) {
          setRotate(false);
          clearInterval(animationInterval);
        }
      }, 30);
    } else {
      clearInterval(animationInterval);
    }

    return () => clearInterval(animationInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinCounter]);

  const layers = [
    new TileLayer({
      id: "tile-layer",
      data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
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

  // const controller = {
  //   controller: true,
  //   inertia: 3000,
  //   touchRotate: true,
  // };

  const onClickHandler = (targetLon) => {
    if (!rotate) {
      setTargetLongitude(targetLon);
      setRotate(true);
      setSpinCounter((prevCounter) => prevCounter + 1);
    }
  };

  const handleLongitudeChange = (e) => {
    setRotate(false);
    console.log("e", e);
    setSelectedLongitude(e);
  };

  return (
    <div>
      <DeckGL
        width="100%"
        height="90%"
        layers={layers}
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        views={new GlobeView()}
        controller={CustomController}
        selectedLongitude={selectedLongitude}

      />

      <Affix position={{ bottom: rem(20), right: rem(15) }}>
        <Flex
          mih={100}
          bg="rgba(0, 0, 0, .0)"
          gap="md"
          justify="center"
          align="end"
          direction="row"
          wrap="wrap"
        >
          <Select
            label="Select a country"
            placeholder="Nothing selected"
            value={selectedLongitude}
            onChange={handleLongitudeChange}
            data={selectConfig}
          />
          <Button
            variant="gradient"
            gradient={{ from: "indigo", to: "cyan" }}
            onClick={() => onClickHandler(selectedLongitude)}
          >
            Spin
          </Button>
        </Flex>
      </Affix>
    </div>
  );
};

export default RotatingGlobe;
