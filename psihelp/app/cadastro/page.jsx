'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import FormCadastroPsicologo from '@/components/FormCadastroPsicologo';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from '@/styles/components.module.css';

export default function CadastroPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?callbackUrl=/cadastro');
    }
  }, [user, loading, router]);

  if (loading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <div className="container">
      <div className={styles.pageHeader}>
        <h1>Cadastro para profissionais de psicologia</h1>
        <p>Seu cadastro será analisado por uma equipe de psicólogos e professores para garantir a conformidade com as normas do CFP.</p>
      </div>
      <FormCadastroPsicologo />
    </div>
  );
}