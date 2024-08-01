<script setup lang="ts">
import { Layer } from '@deck.gl/core';
import Layers from '../common/Layers.vue';
import Legend from '../common/Legend.vue';
import Card from '../common/Card.vue';

const layers: Layer[] = [];
const layerVisibility = {};
const onLayerVisibilityChange = () => {};
</script>
<template>
  <aside class="sidebar">
    <Card>
      <p class="overline">✨👀 You're viewing</p>
      <h1 class="title">Cell towers</h1>
      <p class="body1">
        Cheesecake caramels sesame snaps gummi bears oat cake chupa chups. Chupa
        chups sugar plum tootsie roll powder candy canes. Biscuit cake gummies
        cheesecake cupcake biscuit bear claw icing. Jelly topping caramels gummi
        bears carrot cake pudding.
      </p>
      <p class="body1">
        Bear claw marshmallow gingerbread muffin sweet roll bear claw ice cream
        cake macaroon. Lollipop brownie ice cream pudding sweet gummi bears
        jelly jelly-o tart.
      </p>
    </Card>
    <span class="flex-space" />
    <Card title="Tower count">
      <div class="skeleton" style="height: 8em" />
    </Card>
    <Card title="Towers by radio">
      <div class="skeleton" style="height: 6em" />
    </Card>
  </aside>
  <main class="map">
    <!-- <DeckGL
    layers={layers}
    views={MAP_VIEW}
    initialViewState={viewState}
    controller={{ dragRotate: false }}
    onViewStateChange={({ viewState }) => setViewState(viewState)}
  >
    <Map mapStyle={MAP_STYLE} />
  </DeckGL> -->
    <Layers :layers :layerVisibility :onLayerVisibilityChange />
    <Legend />
    <aside class="map-footer">TODO</aside>
  </main>
</template>
