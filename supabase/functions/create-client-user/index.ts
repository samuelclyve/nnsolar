import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateClientRequest {
  email: string;
  full_name: string;
  phone?: string;
  cpf?: string;
  address?: string;
  city?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email, full_name, phone, cpf, address, city }: CreateClientRequest = await req.json();

    if (!email || !full_name) {
      return new Response(
        JSON.stringify({ error: 'Email e nome são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();

    console.log(`Creating user for email: ${email}`);

    // Create auth user with temporary password
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authData.user.id;
    console.log(`Auth user created with ID: ${userId}`);

    // Create client record
    const { error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        user_id: userId,
        full_name,
        email,
        phone: phone || null,
        cpf: cpf || null,
        address: address || null,
        city: city || null,
      });

    if (clientError) {
      console.error('Error creating client record:', clientError);
      // Try to clean up the auth user if client creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: clientError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assign client role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'client'
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
    }

    // Generate WhatsApp welcome message
    const loginUrl = `${req.headers.get('origin') || 'https://app.nnenergia.com'}/auth`;
    const whatsappMessage = encodeURIComponent(
      `Olá ${full_name.split(' ')[0]}! 🌞\n\n` +
      `Bem-vindo(a) à NN Energia Solar!\n\n` +
      `Seu acesso ao portal do cliente foi criado:\n\n` +
      `📧 Email: ${email}\n` +
      `🔐 Senha temporária: ${tempPassword}\n\n` +
      `Acesse pelo link: ${loginUrl}\n\n` +
      `Por favor, altere sua senha após o primeiro acesso.\n\n` +
      `Qualquer dúvida, estamos à disposição! ☀️`
    );

    const whatsappNumber = phone?.replace(/\D/g, '') || '';
    const whatsappLink = whatsappNumber 
      ? `https://wa.me/55${whatsappNumber}?text=${whatsappMessage}`
      : `https://wa.me/?text=${whatsappMessage}`;

    console.log(`Client created successfully: ${full_name}`);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        temp_password: tempPassword,
        whatsapp_link: whatsappLink,
        message: 'Cliente criado com sucesso!'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specialChars = '!@#$%';
  let password = '';
  
  // Generate 8 random characters
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Add a special character and a number to ensure password meets requirements
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  password += Math.floor(Math.random() * 10);
  
  return password;
}
