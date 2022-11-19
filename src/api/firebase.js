// Import the functions you need from the SDKs you need
import { v4 as uuid } from "uuid";
import { initializeApp } from "firebase/app"; // firebase앱을 가지고 와서
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { getDatabase, ref, set, get, remove } from "firebase/database";

const firebaseConfig = {
  //config object를 설정한 다음에
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
// firebase에서 제공해주는 initilizeApp이라는 함수를 이용해서 firebase를 초기화 해줌.
const auth = getAuth();
const provider = new GoogleAuthProvider();
const database = getDatabase(app);

export function login() {
  signInWithPopup(auth, provider).catch(
    console.error /* error => console.error(error) */
  );
}

export function logout() {
  signOut(auth).catch(console.error);
}

export function onUserStateChange(callback) {
  //호출하는 사람이 사용자의 로그인 상태가 변경된 것에 관심이 있다면 콜백함수를 등록해놔, 변경될때마다 호출해줄게
  onAuthStateChanged(auth, async (user) => {
    // 1. 사용자가 있는 경우에 (로그인한 경우)
    const updatedUser = user ? await adminUser(user) : null;
    // console.log(user);
    callback(updatedUser);
  });
}

async function adminUser(user) {
  // 2. 사용자가 어드민 권한을 가지고 있는지 확인!
  // 3. {...user, isAdmin: true/false}
  return get(ref(database, "admins")) //
    .then((snapshot) => {
      if (snapshot.exists()) {
        const admins = snapshot.val();
        // console.log(admins);
        const isAdmin = admins.includes(user.uid);
        return { ...user, isAdmin };
      }
      return user;
    });
}

export async function addNewProduct(product, image) {
  const id = uuid();
  return set(ref(database, `products/${id}`), {
    ...product,
    id,
    price: parseInt(product.price),
    image,
    options: product.options.split(","),
  });
}

export async function getProducts() {
  // const dbRef = ref(getDatabase());
  return get(ref(database, "products"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        return Object.values(snapshot.val());
      } else {
        console.log("No data available");
        return [];
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

export async function getCart(userId) {
  return get(ref(database, `carts/${userId}`)) //
    .then((snapshot) => {
      const items = snapshot.val() || {};
      console.log(items);
      return Object.values(items);
    });
}

export async function addOrUpdateToCart(userId, product) {
  return set(ref(database, `carts/${userId}/${product.id}`), product);
}

export async function removeFromCart(userId, productId) {
  return remove(ref(database, `carts/${userId}/${productId}`));
}
