package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final NguoiDungRepository nguoiDungRepository;

    public CustomUserDetailsService(NguoiDungRepository nguoiDungRepository) {
        this.nguoiDungRepository = nguoiDungRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + email));

        return new User(
                nguoiDung.getEmail(),
                nguoiDung.getMatKhauHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + nguoiDung.getVaiTro().toUpperCase()))
        );
    }
}
