sudo dnf install openssh-server
sudo systemctl start sshd.service
sudo systemctl enable sshd.service
sudo nano /etc/ssh/sshd_config