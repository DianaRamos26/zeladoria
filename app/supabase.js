import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://knlokhqvlojqqfnvjekk.supabase.co',
  'sb_publishable_XVNrf1fY9xxQpSWR4ipJCA_BlUF2JjC'
);

