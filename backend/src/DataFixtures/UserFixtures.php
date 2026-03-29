<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Création de l'administrateur
        $admin = new User();
        $admin->setLogin('admin');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin123'));
        $admin->setNom('Admin');
        $admin->setPrenom('Super');
        $manager->persist($admin);
        // On ajoute une référence pour que l'admin puisse être retrouvé dans d'autres fixtures
        $this->addReference('user_admin', $admin);

        // Création de 5 joueurs pour tester
        for ($i = 1; $i <= 5; $i++) {
            $joueur = new User();
            $joueur->setLogin('joueur' . $i);
            $joueur->setRoles(['ROLE_USER']);
            $joueur->setPassword($this->passwordHasher->hashPassword($joueur, 'joueur' . $i));
            $joueur->setNom('Nom' . $i);
            $joueur->setPrenom('Prenom' . $i);
            $joueur->setNiveauEtude('Bac+' . rand(1, 5));
            $joueur->setEtablissement('Université ' . $i);
            $manager->persist($joueur);
            // On ajoute une référence pour chaque joueur
            $this->addReference('user_joueur_' . $i, $joueur);
        }

        $manager->flush();
    }
}
