if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

function shuffle(a) {
  let j, x, i;

  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }

  return a;
}

function get(url) {
  return new Promise(function (resolve) {
    const request = new XMLHttpRequest();
    request.open("GET", url + ".json", true);

    request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        resolve(JSON.parse(this.response));
      }
    };

    request.send();
  });
}

let char = null;
let radical = null;

const back = {
  methods: {
    back() {
      this.$emit("back");
    },
  },
};

Vue.component("char-test", {
  data() {
    return {
      reveal: false,
    };
  },

  methods: {
    go() {
      if (this.reveal) {
        this.reveal = false;
        this.$emit("next");
      } else {
        this.reveal = true;
      }
    },
  },

  mixins: [back],

  props: ["index", "item", "size"],

  template: `
<div>
  <p><a href="#" @click.prevent="back">back</a></p>
  <small>{{ index + 1 }}/{{ size }}</small>
  <p style="font-size:128pt; margin: 0;" @click="go">{{ item.char }}</p>
  <p v-if="reveal">{{ item.meaning }}</p>
</div>`,
});

Vue.component("char-list", {
  mixins: [back],

  props: ["items"],

  template: `
<div>
  <p><a href="#" @click.prevent="back">back</a></p>
  <div v-for="item in items">
    <h1>{{ item.char }}</h1>
    <p>{{ item.meaning }}</p>
  </div>
</div>`,
});

Vue.component("char-select", {
  computed: {
    chunks() {
      const cx = [];

      for (let i = 0; i < char.length; i += this.size) {
        cx.push({ text: `${i + 1}-${i + this.size}`, index: i });
      }

      return cx;
    },
  },

  data() {
    return {
      sizes: [20, 50, 100, 200],
    };
  },

  methods: {
    items(index) {
      const start = index;
      const end = start + this.size;

      return char.slice(start, end);
    },

    radical() {
      this.$emit("review", radical.slice(0));
    },

    review(index) {
      this.$emit("review", this.items(index));
    },

    select(size) {
      this.$emit("resize", size);
    },

    test(index) {
      this.$emit("test", shuffle(this.items(index)));
    },

    testRad() {
      this.$emit("test", shuffle(radical.slice(0)));
    },
  },

  props: ["size"],

  template: `
<div>
<p>
  Radicals
  <a href="#" @click.prevent="testRad">test</a>
  <a href="#" @click.prevent="radical">review</a>
</p>
<ul>
  <li v-for="s in sizes">
    <a v-if="size !== s" href="#" @click.prevent="select(s)">{{ s }}</a>
    <span v-if="size === s">{{ s }}</span>
  </li>
  <br>
  <li v-for="c in chunks">
    {{ c.text }}
    <a href="#" @click.prevent="test(c.index)">test</a>
    <a href="#" @click.prevent="review(c.index)">review</a>
  </li>
</ul>
</div>`,
});

function start([cx, rx]) {
  char = [];
  radical = [];

  for (let i = 0; i < cx.length; i++) {
    char.push({ char: cx[i].char, meaning: cx[i].definition });
  }

  for (let i = 0; i < rx.length; i++) {
    //const c = char.find(c => c.char === rx[i].radical);
    radical.push({ char: rx[i].radical, meaning: rx[i].english });
  }

  new Vue({
    computed: {
      showList() {
        return this.items !== null && this.index === -1;
      },

      showTest() {
        return this.items !== null && this.index > -1;
      },
    },

    data: {
      index: -1,
      items: null,
      size: 50,
    },

    el: "#app",

    methods: {
      back() {
        this.items = null;
      },

      next() {
        const i = this.index + 1;

        if (i === this.items.length) {
          this.index = -1;
          this.items = null;
        } else {
          this.index = i;
        }
      },

      resize(size) {
        this.size = size;
      },

      review(items) {
        this.index = -1;
        this.items = items;
      },

      test(items) {
        this.index = 0;
        this.items = items;
      },
    },

    mounted() {
      this.$el.style.display = null;
    },
  });
}

Promise.all([get("db"), get("radical")]).then(start);
