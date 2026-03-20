<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="logo-icon">🏥</div>
        <h1>Clínica Inteligente</h1>
        <p>Faça login para continuar</p>
      </div>

      <form @submit.prevent="login">
        <div class="input-wrap">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="seu@email.com" required />
        </div>
        <div class="input-wrap">
          <label>Senha</label>
          <input v-model="form.senha" type="password" placeholder="••••••••" required />
        </div>

        <div class="toast error" v-if="erro">{{ erro }}</div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <p class="auth-link">
        Não tem conta?
        <RouterLink to="/register">Cadastre-se</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const form = ref({ email: '', senha: '' });
const erro = ref('');
const loading = ref(false);

const login = async () => {
  loading.value = true;
  erro.value = '';
  try {
    const res = await axios.post('http://localhost:5000/auth/login', form.value);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
    router.push('/');
  } catch (err) {
    erro.value = err.response?.data?.error || 'Erro ao fazer login';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  width: 100%;
}

.auth-card {
  background: #111827;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 24px;
  padding: 56px 48px;
  width: 100%;
  max-width: 520px;
  animation: fadeUp 0.6s ease both;
}

.auth-logo {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #00d4a1, #0094ff);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  margin: 0 auto 20px;
  box-shadow: 0 0 40px rgba(0,212,161,0.3);
}

.auth-logo h1 {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 60%, #00d4a1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.auth-logo p { color: #6b7a99; font-size: 15px; }

.input-wrap { margin-bottom: 20px; }

.input-wrap label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #6b7a99;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

input {
  width: 100%;
  background: #0d1526;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 15px 18px;
  color: #e8edf5;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input::placeholder { color: #6b7a99; }
input:focus { border-color: #00d4a1; box-shadow: 0 0 0 3px rgba(0,212,161,0.1); }

.toast.error {
  background: rgba(255,77,109,0.12);
  border: 1px solid rgba(255,77,109,0.3);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  color: #ff4d6d;
  margin-bottom: 16px;
}

.btn-submit {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #00d4a1, #0094ff);
  border: none;
  border-radius: 12px;
  color: #0a0f1e;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  margin-top: 8px;
}

.btn-submit:hover { opacity: 0.92; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.auth-link {
  text-align: center;
  margin-top: 28px;
  font-size: 15px;
  color: #6b7a99;
}

.auth-link a { color: #00d4a1; text-decoration: none; font-weight: 500; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>