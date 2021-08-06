<template>
  <div class="home">
    <HelloWorld v-if="false" msg="Welcome to Your Vue.js App"/>
    <TestBase msg='nihao!'></TestBase>
  </div>
  <CzMap v-show="false" />
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import CzMap from '@/components/czMap/index.vue'
import TestBase from '../components/TestBase.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld,
    CzMap,
    TestBase
  }
}
</script>
