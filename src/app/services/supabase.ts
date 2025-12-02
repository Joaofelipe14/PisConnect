import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
  }

  // ==========================
  // AUTENTICAÇÃO
  // ==========================

  async signUp(email: string, password: string): Promise<User | null> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });


    if (error) throw error;
    return data.user;
  }

  async signIn(email: string, password: string): Promise<User | null> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (data.session) {
      localStorage.setItem('supa_access_token', data.session.access_token);
    }

    if (error) throw error;
    return data.user;
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }


  // ==========================
  // PSICÓLOGOS
  // ==========================

  async buscarPsicologos() {
    const { data, error } = await this.supabase
      .from('psicologos_ativos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data;
  }

  async buscarPsicologoPorId(id: string) {
    const { data, error } = await this.supabase
      .from('psicologos_ativos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async uploadFotoPerfil(usuarioId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `foto_${usuarioId}.${fileExt}`;
    const filePath = `${usuarioId}/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('perfil')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = this.supabase.storage
      .from('perfil')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async toggleAtivoPsicologo(id: string, ativo: any) {
    const { data, error } = await this.supabase
      .from('psicologos')
      .update({ liberado_admin: ativo ? 1 : 0 })  // <-- converte boolean para 1 ou 0
      .eq('id', id);

    if (error) throw error;
    return data;
  }

  async buscarPsicologosAdmin(filtroAtivo?: boolean) {
    let query = this.supabase.from('psicologos').select('*').order('criado_em', { ascending: false });
    if (filtroAtivo !== undefined) {
      query = query.eq('liberado_admin', filtroAtivo ? 1 : 0);  // <-- converte boolean para 1 ou 0
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

}
