import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, User, RefreshCw, PlaneTakeoff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Supabase Auth requires email. If the user provided just "expatur", 
      // we assume they meant an email or we normalize it.
      const email = username.includes("@") ? username : `${username}@expatur.com`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success(t('login.welcome'));
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-[400px] px-4"
      >
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-2xl shadow-primary/20">
            <PlaneTakeoff className="w-10 h-10 text-primary animate-bounce-slow" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            EXPATUR <span className="text-primary">METRICS</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm">Dashboard</p>
        </div>

        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-white">{t('login.title')}</CardTitle>
            <CardDescription className="text-center text-muted-foreground/70">
              {t('login.subtitle')}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs uppercase tracking-widest text-muted-foreground font-bold ml-1">
                  {t('login.user')}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="username"
                    type="text" 
                    placeholder="expatur" 
                    required 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-white/[0.05] border-white/10 focus:border-primary/50 focus:ring-primary/20 h-12 rounded-xl text-white transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                    {t('login.password')}
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password"
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/[0.05] border-white/10 focus:border-primary/50 focus:ring-primary/20 h-12 rounded-xl text-white transition-all"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2 pb-8">
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  t('login.button')
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="mt-8 text-center text-xs text-muted-foreground/40 font-medium">
          &copy; 2026 EXPATUR DASHBOARD. TODOS OS DIREITOS RESERVADOS.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
