<template>
  <div>
    {{msg}}
  </div>
  <h2 v-bind:id="msgId">{{message}}</h2> 
  <h3>{{ reverseMessage }}</h3>
  <button @click="changeMsg"> gaibian</button>
  <a v-bind:href="url">dianwo</a>
  <span>Using mustaches: {{rawHtml}}</span>
  <span v-html="rawHtml"></span>
  <ul :key="g.id" v-for="g in groceryList">
    <li>{{g.text}}</li>
  </ul>
  <form v-on:submit.prevent="sub">
    <input v-model.number="age" type="number" />
    <input v-model.trim='trim' />
  </form>
  <h1 v-show="awesome">Vue is awesome!</h1>
  <h1 v-if="awesome">Vue is awesome!</h1>
  <h1 v-else>Oh no 😢</h1>
</template>
<script>

export default{
  components: {  },
  name:'Test',
  props:{
    msg:{
      type:String,
      default:'morenzhi',
    }
  },
  computed:{
    reverseMessage(){
      return this.message.split('').reverse().join('')
    }
  },
  setup() {
    console.log('setup msg is: ' + this)
  },
  beforeCreate:function(){
    console.log('beforeCreate'); 
  },
  created: function () {
    console.log('created is: ' + this.msg)
  },
  beforeMount:function() {
    console.log('beforeMount');
  },
  mounted:function(){
    console.log('mounted.');
  },
  beforeUnmount:function(){
    console.log('beforeUnmount');
  },
  unmounted:function(){
    console.log('unmounted.')
  },
  data: function() {
    return {
      awesome:0,
      url:'www.baidu.com',
      msgId:'id2',
      rawHtml:'<span style="color:red;">color</span>',
      message: 'xxx',
      groceryList: [
        { id: 0, text: '1' },
        { id: 1, text: '2' },
        { id: 2, text: '3' }
      ],
      age:1,
      trim:' s ss '
    };
  },
  methods:{
    changeMsg(){
      this.message = 'message';
      this.url = 'www.biying.com'
    },
    sub(){
      console.log('sub.....')
    }

  }
  
}
</script>
