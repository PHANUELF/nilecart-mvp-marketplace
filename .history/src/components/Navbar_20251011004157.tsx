import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, LogOut, LayoutDashboard, Home, Shield, User, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" style={{ color: '#7f03fc' }} />
            <span className="text-2xl font-bold">
              <span style={{ color: '#7f03fc' }}>Nile</span>
              <span style={{ color: '#000000' }} className="dark:text-white">Cart</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/home')}
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Browse
                </Button>
                
                {profile?.role === 'seller' && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                )}

                {profile?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/admin')}
                    className="gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                )}

                {/* Buyer Profile Dropdown */}
                {profile?.role === 'buyer' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {profile.full_name || 'Profile'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Non-buyer users still get the old sign out button */}
                {profile?.role !== 'buyer' && (
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};