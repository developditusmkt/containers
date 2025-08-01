import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, SupabaseUser } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  createUser: (email: string, password: string, name: string, role?: 'admin' | 'user') => Promise<{ success: boolean; error?: string }>;
  getAllUsers: () => Promise<{ success: boolean; users?: User[]; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para converter SupabaseUser para User
  const mapSupabaseUserToUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser || !supabaseUser.email) return null;
    
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || 'Usuário',
      email: supabaseUser.email,
      role: (supabaseUser.user_metadata?.role as 'admin' | 'user') || 'user',
    };
  };

  useEffect(() => {
    // Verificar se há sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUserToUser(session.user));
      }
      setIsLoading(false);
    });

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUserToUser(session.user));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(mapSupabaseUserToUser(data.user));
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido ao fazer login' };
    } catch (error) {
      return { success: false, error: 'Erro ao conectar com o servidor' };
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const createUser = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'admin' | 'user' = 'user'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido ao criar usuário' };
    } catch (error) {
      return { success: false, error: 'Erro ao conectar com o servidor' };
    }
  };

  const getAllUsers = async (): Promise<{ success: boolean; users?: User[]; error?: string }> => {
    try {
      // No Supabase, usar admin API para listar usuários
      const { data, error } = await supabase.auth.admin.listUsers();

      if (error) {
        return { success: false, error: error.message };
      }

      const users: User[] = data.users.map(supabaseUser => ({
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || 'Usuário',
        email: supabaseUser.email || '',
        role: (supabaseUser.user_metadata?.role as 'admin' | 'user') || 'user',
      }));

      return { success: true, users };
    } catch (error) {
      return { success: false, error: 'Erro ao buscar usuários' };
    }
  };

  const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao excluir usuário' };
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao enviar email de redefinição' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      createUser,
      getAllUsers,
      deleteUser,
      sendPasswordResetEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};