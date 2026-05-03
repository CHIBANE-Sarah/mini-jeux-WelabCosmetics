<?php

// Namespace du fichier de fixtures.
namespace App\DataFixtures;

// Entité User utilisée pour créer des utilisateurs de test.
use App\Entity\User;

// Classe de base des fixtures Doctrine.
use Doctrine\Bundle\FixturesBundle\Fixture;

// ObjectManager permet d'enregistrer les objets en base.
use Doctrine\Persistence\ObjectManager;

// Service Symfony utilisé pour hacher les mots de passe.
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

// Fixture permettant de créer des utilisateurs de test.
class UserFixtures extends Fixture
{
    // Service de hachage des mots de passe.
    private UserPasswordHasherInterface $passwordHasher;

    // Injection du service de hachage dans la fixture.
    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    // Méthode appelée lors du chargement des fixtures.
    public function load(ObjectManager $manager): void
    {
        // Création d’un utilisateur administrateur.
        $admin = new User();

        // Login utilisé pour se connecter.
        $admin->setLogin('admin');

        // Rôle administrateur donnant accès au dashboard admin.
        $admin->setRoles(['ROLE_ADMIN']);

        // Mot de passe haché avant stockage en base.
        // Le mot de passe réel est admin123, mais la base stocke uniquement le hash.
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin123'));

        // Informations personnelles de test.
        $admin->setNom('Admin');
        $admin->setPrenom('Super');

        // Prépare l'enregistrement de l'admin en base.
        $manager->persist($admin);

        // Ajoute une référence pour pouvoir réutiliser cet admin dans d'autres fixtures.
        $this->addReference('user_admin', $admin);

        // Création de 5 utilisateurs joueurs pour les tests.
        for ($i = 1; $i <= 5; $i++) {
            $joueur = new User();

            // Login unique pour chaque joueur : joueur1, joueur2, etc.
            $joueur->setLogin('joueur' . $i);

            // Rôle simple utilisateur.
            $joueur->setRoles(['ROLE_USER']);

            // Mot de passe haché.
            // Exemple : joueur1 a pour mot de passe joueur1.
            $joueur->setPassword($this->passwordHasher->hashPassword($joueur, 'joueur' . $i));

            // Données fictives.
            $joueur->setNom('Nom' . $i);
            $joueur->setPrenom('Prenom' . $i);
            $joueur->setNiveauEtude('Bac+' . rand(1, 5));
            $joueur->setEtablissement('Université ' . $i);

            // Prépare l'enregistrement du joueur.
            $manager->persist($joueur);

            // Ajoute une référence pour chaque joueur.
            $this->addReference('user_joueur_' . $i, $joueur);
        }

        // Exécute toutes les insertions SQL préparées avec persist().
        $manager->flush();
    }
}